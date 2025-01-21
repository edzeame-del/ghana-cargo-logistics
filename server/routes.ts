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

  const httpServer = createServer(app);
  return httpServer;
}