import { Router } from "express";
import { Booking, Slot, Experience } from "../models";

const router = Router();

// POST /bookings - create a booking while preventing overbooking
router.post("/", async (req, res) => {
  try {
    const { experienceId, slotId, name, email, quantity, totalAmount, promoCode } = req.body;
    if (!experienceId || !slotId || !name || !email || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Atomically increment booked count if room
    const qty = Number(quantity);
    const updatedSlot = await Slot.findOneAndUpdate(
      { slotId, $expr: { $lte: [{ $add: ["$booked", qty] }, "$capacity"] } },
      { $inc: { booked: qty } },
      { new: true }
    ).exec();

    if (!updatedSlot) {
      return res.status(409).json({ error: "Slot is full or quantity exceeds capacity" });
    }

    const booking = await Booking.create({
      experienceId,
      slotId,
      name,
      email,
      quantity: qty,
      totalAmount: Number(totalAmount) || 0,
      promoCode: promoCode || null,
    });

    res.status(201).json({ data: booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

export default router;

// GET /bookings/:id - retrieve a booking with related experience and slot details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).lean().exec();
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const experience = await Experience.findOne({ id: booking.experienceId }).lean().exec();
    const slot = await Slot.findOne({ slotId: booking.slotId }).lean().exec();

    res.json({ data: { ...booking, experience, slot } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load booking" });
  }
});
