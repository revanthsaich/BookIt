import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

// Helper to log and exit on fatal errors
function fatal(msg, err) {
  console.error(msg, err || "");
  process.exit(1);
}

// Mongoose models (inlined so this single file is self-contained)
const { Schema } = mongoose;

const ExperienceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  shortDescription: String,
  description: String,
  pricePerPerson: Number,
  currency: String,
  images: [String],
  duration: String,
  location: String,
  rating: Number,
  reviews: Number,
});

const SlotSchema = new Schema({
  slotId: { type: String, required: true, unique: true },
  experienceId: { type: String, required: true, index: true },
  date: String,
  time: String,
  capacity: Number,
  booked: { type: Number, default: 0 },
});

const PromoSchema = new Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percent", "flat"], required: true },
  amount: Number,
  active: { type: Boolean, default: true },
});

const BookingSchema = new Schema({
  experienceId: { type: String, required: true },
  slotId: { type: String, required: true },
  name: String,
  email: String,
  quantity: Number,
  totalAmount: Number,
  promoCode: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

const Experience = mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);
const Slot = mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
const Promo = mongoose.models.Promo || mongoose.model("Promo", PromoSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

// Create express app and mount all routes
function makeApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Basic request logger
  app.use((req, _res, next) => {
    console.debug(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  // Routes
  // Experiences
  app.get("/api/experiences", async (_req, res) => {
    try {
      const experiences = await Experience.find().sort({ reviews: -1, rating: -1 }).lean().exec();
      res.json({ data: experiences });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load experiences" });
    }
  });

  app.get("/api/experiences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const experience = await Experience.findOne({ id }).lean().exec();
      if (!experience) return res.status(404).json({ error: "Experience not found" });
      const slots = await Slot.find({ experienceId: id }).lean().exec();
      res.json({ data: { ...experience, slots } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load experience" });
    }
  });

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    try {
      const { experienceId, slotId, name, email, quantity, totalAmount, promoCode } = req.body;
      if (!experienceId || !slotId || !name || !email || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: "Invalid quantity" });

      // Atomically update slot booked count if there's capacity
      const updatedSlot = await Slot.findOneAndUpdate(
        { slotId, $expr: { $lte: [{ $add: ["$booked", qty] }, "$capacity"] } },
        { $inc: { booked: qty } },
        { new: true }
      ).exec();

      if (!updatedSlot) return res.status(409).json({ error: "Slot is full or quantity exceeds capacity" });

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

  app.get("/api/bookings/:id", async (req, res) => {
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

  // Promo
  app.post("/api/promo/validate", async (req, res) => {
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

  // Health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Error handler
  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

// Connect to Mongo and return the connected app
async function connectAndCreateApp() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookit";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.info("Mongo connected");
  } catch (err) {
    fatal("Failed to connect to MongoDB", err);
  }

  return makeApp();
}

// Export the app creation for serverless importers
const appPromise = connectAndCreateApp();

export default appPromise;

// If this file is run directly, start an HTTP server
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    const app = await appPromise;
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
  })().catch((err) => fatal("Failed to start server", err));
}

