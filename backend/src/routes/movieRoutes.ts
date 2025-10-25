import express from "express";
import axios from "axios";
import { Movie } from "../models/Movie.js";

const router = express.Router();

/**
 * 🔹 Helper function to fetch a poster from OMDb API
 */
const getPosterUrl = async (title: string): Promise<string> => {
  try {
    const res = await axios.get("https://www.omdbapi.com/", {
      params: { t: title, apikey: process.env.OMDB_API_KEY },
    });

    if (res.data && res.data.Poster && res.data.Poster !== "N/A") {
      return res.data.Poster;
    }
  } catch (error) {
    console.error("❌ Poster fetch failed:", error);
  }

  // fallback if not found
  return "https://via.placeholder.com/250x350?text=No+Image";
};

/**
 * @route   GET /api/movies
 * @desc    Fetch all movies from the database
 */
router.get("/", async (_req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error("❌ Error fetching movies:", error);
    res.status(500).json({ message: "Server Error while fetching movies" });
  }
});

/**
 * @route   POST /api/movies
 * @desc    Add a new movie to the database (with poster caching)
 */
router.post("/", async (req, res) => {
  try {
    const { title, genre, rating, year } = req.body;

    // Validation
    if (!title || !genre || !rating || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch poster once and cache in MongoDB
    const poster = await getPosterUrl(title);

    const newMovie = new Movie({ title, genre, rating, year, poster });
    await newMovie.save();

    res.status(201).json(newMovie);
  } catch (error) {
    console.error("❌ Error adding movie:", error);
    res.status(500).json({ message: "Server Error while adding movie" });
  }
});

/**
 * @route   GET /api/movies/random
 * @desc    Get a random movie recommendation
 */
router.get("/random", async (_req, res) => {
  try {
    const count = await Movie.countDocuments();
    if (count === 0) return res.json(null);

    const random = Math.floor(Math.random() * count);
    const movie = await Movie.findOne().skip(random);

    res.json(movie);
  } catch (error) {
    console.error("❌ Error fetching random movie:", error);
    res.status(500).json({ message: "Server Error while fetching random movie" });
  }
});

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "✅ Movie deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting movie:", error);
    res.status(500).json({ message: "Server Error while deleting movie" });
  }
});

export default router;
