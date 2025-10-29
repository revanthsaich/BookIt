import mongoose from "mongoose";
import dotenv from "dotenv";
import serverless from "serverless-http";
import createApp from "./app.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookit";

let isConnected = false;
async function ensureDb() {
  if (isConnected) return;
  await mongoose.connect(MONGO, { dbName: "bookit" });
  isConnected = true;
  console.log("Connected to MongoDB (vercel)");
}

const app = typeof createApp === "function" ? createApp() : createApp;
const srv = serverless(app);

export default async function handler(req, res) {
  await ensureDb();
  return srv(req, res);
}
