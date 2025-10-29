// apiRouter.ts was an orchestration file used during prior deployment flows.
// The app now mounts route modules directly; this file is retained as a
// harmless shim to avoid accidental imports elsewhere.
import { Router } from "express";
const router = Router();
export default router;
