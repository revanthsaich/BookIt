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
  // debug: ensure the imported router is valid
  // (some module resolution mistakes can lead to `undefined` or an unexpected shape)
  // We'll log a small summary which helps diagnose runtime issues.
  // Remove these logs once debugging is complete.
  // eslint-disable-next-line no-console
  console.log('DEBUG apiRouter type:', typeof apiRouter, 'hasHandle:', !!(apiRouter && (apiRouter as any).handle));

  try {
    app.use(basePath, apiRouter);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to mount apiRouter:', err);
    throw err;
  }

  app.get(`${basePath}health`, (_req, res) => res.json({ ok: true }));

  app.use(errorHandler);

  return app;
}

// Export a ready-to-use app by default for the local server entrypoint. The
// factory function is also available as a named export for consumers that want
// to call it directly.
export default createApp();
