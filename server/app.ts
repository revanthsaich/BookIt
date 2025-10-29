import express from "express";
import cors from "cors";
import apiRouter from "./api";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // mount api router under /api
  app.use("/api", apiRouter);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use(errorHandler);

  return app;
}

export default createApp();
