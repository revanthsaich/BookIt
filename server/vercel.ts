import mongoose from "mongoose";
import dotenv from "dotenv";
import serverless from "serverless-http";
import createApp from "./app";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookit";

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

const app = createApp;

export default async function handler(req: any, res: any) {
  await ensureDb();
  const srv = serverless(app);
  return srv(req, res);
}
