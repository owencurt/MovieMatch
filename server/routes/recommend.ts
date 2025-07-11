import express from "express";
import { getMovieRecommendations } from "../utils/openai";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const movies = await getMovieRecommendations(preferences);
    return res.json(movies);

  } catch (err) {
    console.error("Error generating recommendations:", err);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;
