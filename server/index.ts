import mongoose from "mongoose";
import dotenv from "dotenv";
// Import the app using an explicit JS extension so the built output resolves
// correctly under Node ESM when deployed.
import createApp from "./app.js";

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

  // `server/app.ts` exports a default which may be either an app instance or a
  // factory function. An Express app is callable (typeof === 'function') so we
  // need a stronger check: prefer an exported object that already exposes
  // `.listen`/`.use` (an app instance). If not present, call it as a factory.
  let app: any;
  if (createApp && typeof (createApp as any).listen === "function") {
    app = createApp;
  } else if (typeof createApp === "function") {
    app = (createApp as any)();
  } else {
    throw new Error("Invalid export from ./app — expected an Express app or a factory");
  }

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
