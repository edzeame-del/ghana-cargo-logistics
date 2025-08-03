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
  trackingNumber: text("tracking_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrackingDataSchema = createInsertSchema(trackingData);
export const selectTrackingDataSchema = createSelectSchema(trackingData);
export type InsertTrackingData = typeof trackingData.$inferInsert;
export type SelectTrackingData = typeof trackingData.$inferSelect;