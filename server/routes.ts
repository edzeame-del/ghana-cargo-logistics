import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { db } from "@db";
import { vessels, insertVesselSchema, trackingData, insertTrackingDataSchema } from "@db/schema";
import { eq, like, or } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactSchema.parse(req.body);
      console.log("Contact form submission:", data);
      res.status(200).json({ message: "Message received successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Service request form submission
  app.post("/api/service-request", async (req, res) => {
    try {
      const data = serviceRequestSchema.parse(req.body);
      console.log("Service request submission:", data);
      res.status(200).json({ message: "Service request received successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Service request error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all vessels
  app.get("/api/vessels", async (req, res) => {
    try {
      const allVessels = await db.query.vessels.findMany({
        orderBy: (vessels, { desc }) => [desc(vessels.createdAt)],
      });
      res.json(allVessels);
    } catch (error) {
      console.error("Failed to fetch vessels:", error);
      res.status(500).json({ message: "Failed to fetch vessels" });
    }
  });

  // Add a new vessel
  app.post("/api/vessels", async (req, res) => {
    try {
      const data = insertVesselSchema.parse(req.body);
      const vessel = await db.insert(vessels).values(data).returning();
      res.status(201).json(vessel[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vessel data", errors: error.errors });
      } else {
        console.error("Failed to add vessel:", error);
        res.status(500).json({ message: "Failed to add vessel" });
      }
    }
  });

  // Update a vessel
  app.put("/api/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertVesselSchema.parse(req.body);
      const updatedVessel = await db
        .update(vessels)
        .set(data)
        .where(eq(vessels.id, id))
        .returning();

      if (updatedVessel.length === 0) {
        res.status(404).json({ message: "Vessel not found" });
        return;
      }

      res.json(updatedVessel[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vessel data", errors: error.errors });
      } else {
        console.error("Failed to update vessel:", error);
        res.status(500).json({ message: "Failed to update vessel" });
      }
    }
  });

  // Delete a vessel
  app.delete("/api/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(vessels).where(eq(vessels.id, id));
      res.json({ message: "Vessel deleted successfully" });
    } catch (error) {
      console.error("Failed to delete vessel:", error);
      res.status(500).json({ message: "Failed to delete vessel" });
    }
  });

  // Extract vessel info from MarineTraffic URL
  app.post("/api/vessels/extract-info", async (req, res) => {
    try {
      const { url } = req.body;

      // Updated regex to handle various MarineTraffic URL formats
      const shipIdMatch = url.match(/shipid:(\d+)/);
      const mmsiMatch = url.match(/mmsi:(\d+)/);
      const imoMatch = url.match(/imo:(\d+)/);
      const vesselNameMatch = url.match(/vessel:([^/]+)/);

      if (!shipIdMatch || !mmsiMatch || !imoMatch || !vesselNameMatch) {
        return res.status(400).json({ message: "Invalid MarineTraffic URL format" });
      }

      const shipId = shipIdMatch[1];
      const mmsi = mmsiMatch[1];
      const imo = imoMatch[1];
      const name = vesselNameMatch[1].replace(/_/g, ' ');

      // Construct thumbnail URL from the GENERAL tab
      const thumbnailUrl = `https://photos.marinetraffic.com/ais/showphoto.aspx?photoid=${shipId}`;

      res.json({
        name,
        imo,
        mmsi,
        trackingUrl: url,
        thumbnailUrl
      });
    } catch (error) {
      console.error("Failed to extract vessel info:", error);
      res.status(500).json({ message: "Failed to extract vessel information" });
    }
  });

  // Get a specific vessel
  app.get("/api/vessels/:id", async (req, res) => {
    try {
      const vessel = await db.query.vessels.findFirst({
        where: eq(vessels.id, parseInt(req.params.id)),
      });
      if (!vessel) {
        res.status(404).json({ message: "Vessel not found" });
        return;
      }
      res.json(vessel);
    } catch (error) {
      console.error("Failed to fetch vessel:", error);
      res.status(500).json({ message: "Failed to fetch vessel" });
    }
  });

  // Upload CSV tracking data
  app.post("/api/tracking/upload", async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Invalid CSV data format" });
      }

      // Clear existing data and insert new data
      await db.delete(trackingData);
      
      const insertData = data.map(row => ({
        shippingMark: row["shipping mark"] || row["shipping_mark"] || "",
        dateReceived: row["Date Received"] || row["date_received"] || "",
        dateLoaded: row["Date Loaded"] || row["date_loaded"] || "",
        quantity: row["Quantity"] || row["quantity"] || "",
        cbm: row["CBM"] || row["cbm"] || "",
        trackingNumber: row["tracking number"] || row["tracking_number"] || "",
      }));

      const result = await db.insert(trackingData).values(insertData).returning();
      res.json({ message: "CSV data uploaded successfully", count: result.length });
    } catch (error) {
      console.error("Failed to upload CSV data:", error);
      res.status(500).json({ message: "Failed to upload CSV data" });
    }
  });

  // Track by tracking number (full or last 6 digits)
  app.get("/api/tracking/:number", async (req, res) => {
    try {
      const { number } = req.params;
      
      let result;
      if (number.length === 6) {
        // Search by last 6 digits
        result = await db.query.trackingData.findFirst({
          where: like(trackingData.trackingNumber, `%${number}`),
        });
      } else {
        // Search by full tracking number
        result = await db.query.trackingData.findFirst({
          where: eq(trackingData.trackingNumber, number),
        });
      }

      if (!result) {
        return res.status(404).json({ message: "Tracking number not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  // Get all tracking data (for admin)
  app.get("/api/tracking", async (req, res) => {
    try {
      const allData = await db.query.trackingData.findMany({
        orderBy: (trackingData, { desc }) => [desc(trackingData.createdAt)],
      });
      res.json(allData);
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().min(10),
});

const serviceRequestSchema = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  serviceType: z.string().min(1),
  requirements: z.string().min(10),
});