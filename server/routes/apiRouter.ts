import { Router } from "express";
import experiences from "../routes/experiences.js";
import bookings from "../routes/bookings.js";
import promo from "../routes/promo.js";

const router = Router();

router.use("/experiences", experiences);
router.use("/bookings", bookings);
router.use("/promo", promo);

export default router;
