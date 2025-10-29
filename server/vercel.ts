import mongoose from "mongoose";
import dotenv from "dotenv";
import serverless from "serverless-http";
import type { Request, Response } from "express";
import createApp from "./app.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookit";

let isConnected = false;
async function ensureDb() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO, { dbName: "bookit" });
    isConnected = true;
    console.log("✅ Connected to MongoDB (vercel)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// Fix TypeScript warning by narrowing type safely
let app: any;
if (typeof createApp === "function") {
  try {
    // Create the Express app instance
    app = (createApp as unknown as () => any)();
  } catch {
    // If it’s already an app instance, use directly
    app = createApp;
  }
} else {
  app = createApp;
}

const srv = serverless(app);

// Properly typed handler (works with Vercel + Express)
export default async function handler(req: Request, res: Response) {
  await ensureDb();
  return srv(req, res);
}
