import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

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

      // Note: This is a mock response for demonstration
      // In production, you would call the MarineTraffic API here
      const mockVesselData = {
        name: vesselName,
        latitude: 5.6037 + (Math.random() * 0.1),
        longitude: -0.1870 + (Math.random() * 0.1),
        speed: Math.floor(Math.random() * 20),
        course: Math.floor(Math.random() * 360),
        lastUpdate: new Date().toISOString(),
      };

      res.json(mockVesselData);
    } catch (error) {
      console.error("Vessel search error:", error);
      res.status(500).json({ message: "Failed to search for vessel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}