import mongoose from "mongoose";
import dotenv from "dotenv";
import serverless from "serverless-http";
import createApp from "./app";

dotenv.config();

// Accept either MONGO_URI (preferred) or MONGODB_URI (from older .env) for flexibility
const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookit";

// connect to MongoDB once per lambda cold-start if possible
let isConnected = false;
async function ensureDb() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO, { dbName: "bookit" });
    isConnected = true;
    console.log("Connected to MongoDB (vercel)", MONGO);
  } catch (err) {
    console.error("Mongo connection failed in serverless handler", err);
  }
}

// `createApp` (default export from ./app) is already an Express app instance
// (created at module load). Wrap it once with serverless instead of creating
// a new wrapper on every incoming request.
const app = createApp;
const srv = serverless(app as any);

export default async function handler(req: any, res: any) {
  await ensureDb();
  return srv(req, res);
}
