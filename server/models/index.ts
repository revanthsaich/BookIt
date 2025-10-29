import mongoose, { Schema, Document, Model } from "mongoose";

// Experience
export interface IExperience extends Document {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  pricePerPerson: number;
  currency: string;
  images: string[];
  duration: string;
  location: string;
  rating?: number;
  reviews?: number;
}

const ExperienceSchema = new Schema<IExperience>({
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

export const Experience: Model<IExperience> = mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);

// Slot
export interface ISlot extends Document {
  slotId: string;
  experienceId: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
}

const SlotSchema = new Schema<ISlot>({
  slotId: { type: String, required: true, unique: true },
  experienceId: { type: String, required: true, index: true },
  date: String,
  time: String,
  capacity: Number,
  booked: { type: Number, default: 0 },
});

export const Slot: Model<ISlot> = mongoose.models.Slot || mongoose.model("Slot", SlotSchema);

// Promo
export interface IPromo extends Document {
  code: string;
  type: "percent" | "flat";
  amount: number;
  active: boolean;
}

const PromoSchema = new Schema<IPromo>({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percent", "flat"], required: true },
  amount: Number,
  active: { type: Boolean, default: true },
});

export const Promo: Model<IPromo> = mongoose.models.Promo || mongoose.model("Promo", PromoSchema);

// Booking
export interface IBooking extends Document {
  experienceId: string;
  slotId: string;
  name: string;
  email: string;
  quantity: number;
  totalAmount: number;
  promoCode?: string | null;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  experienceId: { type: String, required: true },
  slotId: { type: String, required: true },
  name: String,
  email: String,
  quantity: Number,
  totalAmount: Number,
  promoCode: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
