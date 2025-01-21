import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import fetch from "node-fetch";

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

// Define the vessel data schema
const vesselDataSchema = z.object({
  MMSI: z.string().optional(),
  IMO: z.string().optional(),
  SHIP_NAME: z.string(),
  LATITUDE: z.number(),
  LONGITUDE: z.number(),
  SPEED: z.number(),
  HEADING: z.number(),
  LAST_POS: z.string(),
});

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

  // Vessel tracking endpoint
  app.get("/api/vessel/search", async (req, res) => {
    try {
      const vesselName = req.query.name as string;

      if (!vesselName) {
        return res.status(400).json({ message: "Vessel name is required" });
      }

      // Use the AIS Stream API's free endpoint
      // This is a mock response for demo purposes since we don't have the actual API key
      // In production, you would integrate with a real AIS data provider
      const mockVesselData = {
        SHIP_NAME: vesselName,
        LATITUDE: 5.5557, // Tema Port coordinates
        LONGITUDE: -0.0137,
        SPEED: 12.5,
        HEADING: 180,
        LAST_POS: new Date().toISOString(),
      };

      try {
        const validatedData = vesselDataSchema.parse(mockVesselData);

        // Transform to our frontend format
        const vesselData = {
          name: validatedData.SHIP_NAME,
          latitude: validatedData.LATITUDE,
          longitude: validatedData.LONGITUDE,
          speed: validatedData.SPEED,
          course: validatedData.HEADING,
          lastUpdate: validatedData.LAST_POS,
        };

        res.json(vesselData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error("Invalid vessel data format");
        }
        throw error;
      }
    } catch (error) {
      console.error("Vessel search error:", error);
      res.status(500).json({ 
        message: "Failed to search for vessel",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}