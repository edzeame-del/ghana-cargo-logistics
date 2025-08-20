import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { db } from "@db";
import { vessels, insertVesselSchema, trackingData, insertTrackingDataSchema } from "@db/schema";
import { eq, like, or, lt, inArray, and, ne, ilike, count } from "drizzle-orm";
import { setupAuth } from "./auth";
import { googleSheetsService } from "./google-sheets";

// Cleanup function to delete tracking data 90 days after ETA
async function cleanupOldTrackingData() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Delete records where ETA is older than 90 days
    // Only delete records that have a valid ETA date
    const result = await db
      .delete(trackingData)
      .where(
        and(
          lt(trackingData.eta, ninetyDaysAgoStr),
          ne(trackingData.eta, ""), // Don't delete records without ETA
          ne(trackingData.eta, "Not Yet Loaded") // Don't delete pending records
        )
      );
    
    const deletedCount = result.rowCount || 0;
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} tracking records with ETA older than 90 days`);
    }
  } catch (error) {
    console.error("Error during tracking data cleanup:", error);
  }
}

// Schedule cleanup to run every 24 hours
setInterval(cleanupOldTrackingData, 24 * 60 * 60 * 1000);

// Run cleanup on server start
cleanupOldTrackingData();

// Database warmup function to prevent cold starts
async function warmupDatabase() {
  try {
    console.log('Warming up database connection...');
    await db.query.trackingData.findFirst({
      where: eq(trackingData.id, -1) // This will return no results but warms up the connection
    });
    console.log('Database connection warmed up successfully');
  } catch (error) {
    console.error('Database warmup failed:', error);
  }
}

// Warmup database on server start
warmupDatabase();

// Keep database connection alive with periodic health checks
setInterval(async () => {
  try {
    await db.query.trackingData.findFirst({
      where: eq(trackingData.id, -1)
    });
  } catch (error) {
    console.error('Database health check failed:', error);
  }
}, 4 * 60 * 1000); // Every 4 minutes to prevent 5-minute timeout

export function registerRoutes(app: Express): Server {
  // Setup authentication
  setupAuth(app);

  // Database health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      await db.query.trackingData.findFirst({
        where: eq(trackingData.id, -1)
      });
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        database: "connected" 
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({ 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
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

  // Upload spreadsheet tracking data
  app.post("/api/tracking/upload", async (req, res) => {
    try {
      const { data } = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Invalid spreadsheet data format" });
      }

      // Clear existing data and insert new data
      await db.delete(trackingData);
      
      // Helper function for column value extraction (defined before use)
      const getColumnValueHelper = (row: any, variations: string[]) => {
        for (const variation of variations) {
          if (row[variation] !== undefined && row[variation] !== '') {
            return row[variation];
          }
          const key = Object.keys(row).find(k => k.toLowerCase() === variation.toLowerCase());
          if (key && row[key] !== undefined && row[key] !== '') {
            return row[key];
          }
          const normalizedVariation = variation.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedVariation);
          if (normalizedKey && row[normalizedKey] !== undefined && row[normalizedKey] !== '') {
            return row[normalizedKey];
          }
        }
        return "";
      };

      // Duplicate tracking numbers are now allowed

      console.log('Processing upload data:', JSON.stringify(data.slice(0, 2), null, 2));



      const insertData = data.map(row => {

        const processDate = (dateValue: any) => {
          if (!dateValue) return "";

          // If it's already a formatted date string (YYYY-MM-DD), return as is
          if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
            return dateValue.trim();
          }

          // Handle Excel date serial numbers - convert string numbers too
          const numericValue = typeof dateValue === 'string' ? parseFloat(dateValue) : dateValue;
          
          if (typeof numericValue === 'number' && !isNaN(numericValue) && numericValue > 1 && numericValue < 100000) {
            // Excel date serial number conversion
            // Excel counts days from January 1, 1900 (with 1900 being day 1)
            const excelStartDate = new Date(1900, 0, 1); // January 1, 1900
            const jsDate = new Date(excelStartDate.getTime() + (numericValue - 1) * 24 * 60 * 60 * 1000);
            
            if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 3000) {
              const year = jsDate.getFullYear();
              const month = String(jsDate.getMonth() + 1).padStart(2, '0');
              const day = String(jsDate.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
          }

          // Try to parse as regular date string
          if (typeof dateValue === 'string' && dateValue.trim()) {
            const parsedDate = new Date(dateValue.trim());
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0];
            }
          }

          return dateValue ? dateValue.toString().trim() : "";
        };

        return {
          shippingMark: getColumnValueHelper(row, ["SHIPPING MARK", "shipping mark", "shippingmark"]),
          dateReceived: processDate(getColumnValueHelper(row, ["RECEIVED", "Date Received", "datereceived", "received"])),
          dateLoaded: processDate(getColumnValueHelper(row, ["LOADED", "Date Loaded", "dateloaded", "loaded"])),
          quantity: getColumnValueHelper(row, ["QUANTITY", "Quantity", "quantity"]),
          cbm: getColumnValueHelper(row, ["CBM", "cbm"]),
          trackingNumber: getColumnValueHelper(row, ["TRACKING NUMBER", "tracking number", "trackingnumber"]),
          eta: processDate(getColumnValueHelper(row, ["ETA", "eta"])),
          status: getColumnValueHelper(row, ["STATUS", "status"]),
        };
      });

      console.log('Inserting data:', insertData.slice(0, 2));
      const result = await db.insert(trackingData).values(insertData).returning();
      res.json({ message: "Spreadsheet data uploaded successfully", count: result.length });
    } catch (error) {
      console.error("Failed to upload spreadsheet data:", error);
      res.status(500).json({ message: "Failed to upload spreadsheet data" });
    }
  });

  // Track by tracking number(s) or shipping mark - supports comma-separated list and returns all matches
  app.get("/api/tracking/:searchTerm", async (req, res) => {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const { searchTerm } = req.params;
        const searchItems = searchTerm.split(',').map(n => n.trim()).filter(n => n.length > 0);

        if (searchItems.length === 0) {
          return res.status(400).json({ message: "No valid search terms provided" });
        }

        let allResults = [];

        for (const searchItem of searchItems) {
          let results = [];
          
          // Check if this looks like a tracking number (numeric or alphanumeric with specific patterns)
          const isLikelyTrackingNumber = /^[A-Z0-9]+$/i.test(searchItem) && searchItem.length >= 6;
          
          if (isLikelyTrackingNumber) {
            // Search as tracking number
            if (searchItem.length === 6) {
              // Search by last 6 digits
              results = await db.query.trackingData.findMany({
                where: like(trackingData.trackingNumber, `%${searchItem}`),
                orderBy: (trackingData, { desc }) => [desc(trackingData.createdAt)],
              });
            } else {
              // Search by full tracking number
              results = await db.query.trackingData.findMany({
                where: eq(trackingData.trackingNumber, searchItem),
                orderBy: (trackingData, { desc }) => [desc(trackingData.createdAt)],
              });
            }
          } else {
            // Search as shipping mark - show goods received in past 2 weeks
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            results = await db.query.trackingData.findMany({
              where: and(
                ilike(trackingData.shippingMark, `%${searchItem}%`),
                or(
                  // Include records received in past 2 weeks
                  and(
                    ne(trackingData.dateReceived, ""),
                    ne(trackingData.dateReceived, "N/A"),
                    ne(trackingData.dateReceived, "null"),
                    like(trackingData.dateReceived, "20%"), // Valid year starting with 20
                    or(
                      like(trackingData.dateReceived, "2025-08-%"), // August 2025
                      like(trackingData.dateReceived, "2025-07-%"), // July 2025 (recent)
                      like(trackingData.dateReceived, "2025-09-%")  // September 2025
                    )
                  ),
                  // Always include pending goods (not yet loaded)
                  eq(trackingData.status, "Pending Loading")
                )
              ),
              orderBy: (trackingData, { desc, asc }) => [
                desc(trackingData.status), // Pending Loading first
                desc(trackingData.dateReceived), // Most recent first
                desc(trackingData.createdAt)
              ],
            });
          }

          if (results && results.length > 0) {
            allResults.push(...results);
          }
        }

        if (allResults.length === 0) {
          const searchType = searchItems.some(item => /^[A-Z0-9]+$/i.test(item) && item.length >= 6) 
            ? "tracking numbers" : "shipping marks";
          return res.status(404).json({ message: `No ${searchType} found` });
        }

        // Remove duplicates based on ID
        const uniqueResults = allResults.filter((item, index, arr) => 
          arr.findIndex(t => t.id === item.id) === index
        );

        return res.json(uniqueResults);
      } catch (error) {
        attempt++;
        console.error(`Search attempt ${attempt} failed:`, error);
        
        if (attempt >= maxRetries) {
          return res.status(500).json({ message: "Database temporarily unavailable. Please try again." });
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  });

  // Get all tracking data (for admin) with pagination
  app.get("/api/tracking", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 200;
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const [{ count: totalCount }] = await db.select({ count: count() }).from(trackingData);
      
      // Get paginated data
      const allData = await db.query.trackingData.findMany({
        orderBy: (trackingData, { desc }) => [desc(trackingData.createdAt)],
        limit: limit,
        offset: offset,
      });

      res.json({
        data: allData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  // Manual cleanup endpoint for admin (optional)
  app.post("/api/tracking/cleanup", async (req, res) => {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Delete records where ETA is older than 90 days
      const result = await db
        .delete(trackingData)
        .where(
          and(
            lt(trackingData.eta, ninetyDaysAgoStr),
            ne(trackingData.eta, ""), // Don't delete records without ETA
            ne(trackingData.eta, "Not Yet Loaded") // Don't delete pending records
          )
        );
      
      res.json({ 
        message: "Cleanup completed successfully - deleted records with ETA older than 90 days", 
        deletedCount: result.rowCount || 0 
      });
    } catch (error) {
      console.error("Manual cleanup failed:", error);
      res.status(500).json({ message: "Cleanup failed" });
    }
  });

  // Bulk delete tracking records by IDs
  app.delete("/api/tracking/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      // Validate that all IDs are numbers
      const validIds = ids.filter(id => typeof id === 'number' && !isNaN(id));
      if (validIds.length !== ids.length) {
        return res.status(400).json({ message: "All IDs must be valid numbers" });
      }

      const result = await db
        .delete(trackingData)
        .where(inArray(trackingData.id, validIds));
      
      res.json({ 
        message: "Tracking records deleted successfully", 
        count: result.rowCount || 0 
      });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      res.status(500).json({ message: "Failed to delete tracking records" });
    }
  });

  // Google Sheets integration endpoints
  app.get("/api/google-sheets/status", async (req, res) => {
    try {
      const status = googleSheetsService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Failed to get Google Sheets status:", error);
      res.status(500).json({ message: "Failed to get status" });
    }
  });

  app.post("/api/google-sheets/sync", async (req, res) => {
    try {
      const result = await googleSheetsService.manualSync();
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Manual sync failed:", error);
      res.status(500).json({ message: "Failed to sync Google Sheets" });
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