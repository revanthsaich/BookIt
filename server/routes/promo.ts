import { Router } from "express";
import { Promo } from "../models";

const router = Router();

// POST /promo/validate - validate a promo code and return discount info
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code required" });
    const promo = await Promo.findOne({ code: String(code).toUpperCase(), active: true }).lean().exec();
    if (!promo) return res.status(404).json({ valid: false });
    res.json({ valid: true, promo: { code: promo.code, type: promo.type, amount: promo.amount } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate promo" });
  }
});

export default router;
