import express from "express";
import { getMovieRecommendations } from "../utils/openai";
import { fetchTMDbMetadata } from "../utils/tmdb";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { preferences } = req.body;
    console.log("Received Request:", req.body);

    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const aiMovies = await getMovieRecommendations(preferences);

    const filteredMovies = aiMovies.filter((m): m is { title: string; year: number; why: string } => m !== null);
    const enrichedMovies = await fetchTMDbMetadata(filteredMovies);


    return res.json(enrichedMovies);

  } catch (err) {
    console.error("Error generating recommendations:", err);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
});


export default router;
