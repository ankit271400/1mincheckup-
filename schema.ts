import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  age: integer("age"),
  gender: text("gender"),
  height: integer("height"),
  weight: integer("weight"),
  conditions: json("conditions").$type<string[]>(),
  medications: json("medications").$type<string[]>(),
});

// Blood Sugar Readings table
export const bloodSugarReadings = pgTable("blood_sugar_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  value: integer("value").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
  status: text("status"),
  aiAnalysis: json("ai_analysis").$type<BloodSugarAnalysis>(),
});

// Blood Pressure Readings table
export const bloodPressureReadings = pgTable("blood_pressure_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
  status: text("status"),
  aiAnalysis: json("ai_analysis").$type<BloodPressureAnalysis>(),
});

// Connected Devices table
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  lastSync: timestamp("last_sync"),
  status: text("status"),
  connectionDetails: json("connection_details"),
});

// AI Chat History table
export const aiChatHistory = pgTable("ai_chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  category: text("category"),
});

// Type definitions
export type BloodSugarAnalysis = {
  status: 'Normal' | 'Elevated' | 'High' | 'Very High' | 'Low' | 'Very Low';
  suggestion: string;
  riskLevel: number; // 0-100 scale
};

export type BloodPressureAnalysis = {
  status: 'Normal' | 'Elevated' | 'Hypertension Stage 1' | 'Hypertension Stage 2' | 'Hypertensive Crisis' | 'Low';
  suggestion: string;
  riskLevel: number; // 0-100 scale
};

// Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  age: true,
  gender: true,
  height: true,
  weight: true,
  conditions: true,
  medications: true,
});

export const insertBloodSugarReadingSchema = createInsertSchema(bloodSugarReadings).pick({
  userId: true,
  value: true,
  timestamp: true,
  notes: true,
  status: true,
  aiAnalysis: true,
});

export const insertBloodPressureReadingSchema = createInsertSchema(bloodPressureReadings).pick({
  userId: true,
  systolic: true,
  diastolic: true,
  timestamp: true,
  notes: true,
  status: true,
  aiAnalysis: true,
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  userId: true,
  name: true,
  type: true,
  lastSync: true,
  status: true,
  connectionDetails: true,
});

export const insertAIChatHistorySchema = createInsertSchema(aiChatHistory).pick({
  userId: true,
  message: true,
  response: true,
  timestamp: true,
  category: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBloodSugarReading = z.infer<typeof insertBloodSugarReadingSchema>;
export type BloodSugarReading = typeof bloodSugarReadings.$inferSelect;

export type InsertBloodPressureReading = z.infer<typeof insertBloodPressureReadingSchema>;
export type BloodPressureReading = typeof bloodPressureReadings.$inferSelect;

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export type InsertAIChatHistory = z.infer<typeof insertAIChatHistorySchema>;
export type AIChatHistory = typeof aiChatHistory.$inferSelect;
