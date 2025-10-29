import { Router } from "express";
import { Experience, Slot } from "../models";

const router = Router();

router.get("/", async (_req, res) => {
  try {
  // sort by number of reviews (descending) so most-reviewed experiences appear first
  // tie-break by rating (descending) so higher-rated items appear earlier when review counts match
  const experiences = await Experience.find().sort({ reviews: -1, rating: -1 }).lean().exec();
    res.json({ data: experiences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load experiences" });
  }
});

router.get("/:id", async (req, res) => {
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

export default router;
