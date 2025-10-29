import handler from "../vercel";
import { Router } from "express";
import experiences from "../routes/experiences";
import bookings from "../routes/bookings";
import promo from "../routes/promo";

const router = Router();

router.use("/experiences", experiences);
router.use("/bookings", bookings);
router.use("/promo", promo);

// Vercel will set VERCEL or VERCEL_ENV — when deployed we must export the
// serverless handler as the default export. Locally we keep exporting the
// Express router so `server/index.ts` can mount it.
const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
const exported: any = isVercel ? handler : router;

export default exported;
