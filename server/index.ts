import mongoose from "mongoose";
import dotenv from "dotenv";
import createApp from "./app";

dotenv.config();

// Accept either MONGO_URI or MONGODB_URI for compatibility with different envs
const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookit";
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// start the server locally (used for development)
async function main() {
  try {
    await mongoose.connect(MONGO, { dbName: "bookit" });
    console.log("Connected to MongoDB", MONGO);
  } catch (err) {
    console.warn("Mongo connection failed - backend will still start but DB operations may fail.", err);
  }

  // `server/app.ts` exports a default which may be either an app instance or the
  // factory function. Make this robust so the dev server works regardless.
  const app = typeof createApp === "function" ? (createApp as any)() : createApp;

  // start server and attach error handler (handle EADDRINUSE)
  const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Is another server running?`);
      process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// server entrypoint complete
