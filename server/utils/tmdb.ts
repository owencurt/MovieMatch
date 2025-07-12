import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

// Full movie card
export async function fetchTMDbMetadata(movies: { title: string; year?: number; why?: string }[]) {
  const results = [];

  for (const movie of movies) {
    try {
      const searchUrl = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}${movie.year ? `&year=${movie.year}` : ""}`;
      const searchRes = await axios.get(searchUrl);
      const result = searchRes.data.results?.[0];

      if (!result) continue;

      const movieId = result.id;

      const detailsRes = await axios.get(`${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
      const videosRes = await axios.get(`${TMDB_BASE}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);

      const trailer = videosRes.data.results.find((v: any) =>
        v.site === "YouTube" && v.type === "Trailer"
      );

      results.push({
        title: movie.title,
        year: movie.year,
        why: movie.why,
        summary: result.overview,
        poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null,
        runtime: detailsRes.data.runtime,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      });

    } catch (err: any) {
        console.warn(`TMDb error for ${movie.title}:`, err.message);
}
  }

  return results;
}
