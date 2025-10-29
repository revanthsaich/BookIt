import { Router } from "express";
import experiences from "../routes/experiences";
import bookings from "../routes/bookings";
import promo from "../routes/promo";

const router = Router();

router.use("/experiences", experiences);
router.use("/bookings", bookings);
router.use("/promo", promo);

export default router;
