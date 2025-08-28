import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const vessels = pgTable("vessels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imo: text("imo").notNull(),
  mmsi: text("mmsi").notNull(),
  trackingUrl: text("tracking_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVesselSchema = createInsertSchema(vessels);
export const selectVesselSchema = createSelectSchema(vessels);
export type InsertVessel = typeof vessels.$inferInsert;
export type SelectVessel = typeof vessels.$inferSelect;

export const trackingData = pgTable("tracking_data", {
  id: serial("id").primaryKey(),
  shippingMark: text("shipping_mark").notNull(),
  dateReceived: text("date_received"),
  dateLoaded: text("date_loaded"),
  quantity: text("quantity"),
  cbm: text("cbm"),
  trackingNumber: text("tracking_number").notNull(),
  eta: text("eta"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrackingDataSchema = createInsertSchema(trackingData);
export const selectTrackingDataSchema = createSelectSchema(trackingData);
export type InsertTrackingData = typeof trackingData.$inferInsert;
export type SelectTrackingData = typeof trackingData.$inferSelect;

export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  searchTerm: text("search_term").notNull(),
  searchType: text("search_type").notNull(), // 'tracking_number' or 'shipping_mark'
  success: boolean("success").notNull(),
  resultsCount: integer("results_count").notNull().default(0),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSearchLogSchema = createInsertSchema(searchLogs);
export const selectSearchLogSchema = createSelectSchema(searchLogs);
export type InsertSearchLog = typeof searchLogs.$inferInsert;
export type SelectSearchLog = typeof searchLogs.$inferSelect;

export const dailySearchStats = pgTable("daily_search_stats", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  totalSearches: integer("total_searches").notNull().default(0),
  successfulSearches: integer("successful_searches").notNull().default(0),
  failedSearches: integer("failed_searches").notNull().default(0),
  trackingNumberSearches: integer("tracking_number_searches").notNull().default(0),
  shippingMarkSearches: integer("shipping_mark_searches").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDailySearchStatsSchema = createInsertSchema(dailySearchStats);
export const selectDailySearchStatsSchema = createSelectSchema(dailySearchStats);
export type InsertDailySearchStats = typeof dailySearchStats.$inferInsert;
export type SelectDailySearchStats = typeof dailySearchStats.$inferSelect;