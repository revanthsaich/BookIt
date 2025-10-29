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

  // When running as a Vercel serverless function the incoming path will already be
  // prefixed with `/api` by the platform. To avoid double-prefixing we mount the
  // router at `/` in that environment. Locally (dev server) we keep `/api` so
  // existing dev URLs continue to work.
  const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
  const basePath = isVercel ? "/" : "/api";

  app.use(basePath, apiRouter);

  app.get(`${basePath}health`, (_req, res) => res.json({ ok: true }));

  app.use(errorHandler);

  return app;
}

// Export a ready-to-use app by default for the local server entrypoint. The
// factory function is also available as a named export for consumers that want
// to call it directly.
export default createApp();
