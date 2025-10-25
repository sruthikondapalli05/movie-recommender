import React, { useState, useEffect } from "react";
import axios from "axios";

// 🧩 Define types
interface Movie {
  _id?: string;
  title: string;
  genre: string;
  rating: number;
  year: number;
  poster?: string;
}

interface OmdbResponse {
  Poster?: string;
}

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [recommendation, setRecommendation] = useState<Movie | null>(null);

  // 🌍 API Base URL (reads from .env)
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // 🟢 Fetch all movies on load
  useEffect(() => {
    fetchMovies();
  }, []);

  // 🎞️ Fetch movies from backend + attach posters
  const fetchMovies = async () => {
    try {
      console.log("📡 Fetching movies from:", `${API_URL}/api/movies`);
      const res = await axios.get<Movie[]>(`${API_URL}/api/movies`);

      // Attach posters from OMDb API
      const moviesWithPosters = await Promise.all(
        res.data.map(async (m) => {
          const poster = await getPosterUrl(m.title);
          return { ...m, poster };
        })
      );

      setMovies(moviesWithPosters);
    } catch (error) {
      console.error("❌ Error fetching movies:", error);
      alert("Backend connection failed! Please check if the backend is running.");
    }
  };

  // 🧠 Get poster URL from OMDb API
  const getPosterUrl = async (title: string): Promise<string> => {
    try {
      const res = await axios.get<OmdbResponse>("https://www.omdbapi.com/", {
        params: {
          t: title,
          apikey: process.env.REACT_APP_OMDB_API_KEY,
        },
      });

      if (res.data?.Poster && res.data.Poster !== "N/A") {
        return res.data.Poster;
      }
    } catch (error) {
      console.warn("⚠️ Poster fetch failed for:", title);
    }

    // fallback image
    return "https://via.placeholder.com/250x350?text=No+Image";
  };

  // ➕ Add a new movie
  const addMovie = async () => {
    if (!title || !genre || !rating || !year) return;
    const newMovie = { title, genre, rating: Number(rating), year: Number(year) };

    try {
      await axios.post(`${API_URL}/api/movies`, newMovie);
      await fetchMovies();
      setTitle("");
      setGenre("");
      setRating("");
      setYear("");
    } catch (error) {
      console.error("❌ Error adding movie:", error);
      alert("Failed to add movie. Check backend connection.");
    }
  };

  // ❌ Delete a movie
  const deleteMovie = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/movies/${id}`);
      fetchMovies();
    } catch (error) {
      console.error("❌ Error deleting movie:", error);
    }
  };

  // 🎲 Recommend a random movie
  const recommendMovie = () => {
    if (movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      setRecommendation(randomMovie);
    }
  };

  // 🔍 Filter movies by search term
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔢 Sort movies by rating or year
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "year") return b.year - a.year;
    return 0;
  });

  // 🖼️ UI
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🎬 Movie Recommendation System
      </h1>

      {/* 🔍 Search & Sort */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sort by...</option>
          <option value="rating">Rating</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* 🎞️ Movie Cards */}
      <div className="flex flex-wrap justify-center gap-4">
        {sortedMovies.map((movie) => (
          <div
            key={movie._id}
            className="bg-white shadow-md rounded-xl p-4 w-60 text-center hover:shadow-lg transition"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="rounded-lg w-full h-72 object-cover mb-3"
            />
            <h2 className="font-bold text-lg">{movie.title}</h2>
            <p className="text-sm text-gray-600">{movie.genre}</p>
            <p className="text-yellow-500">⭐ {movie.rating}</p>
            <p className="text-gray-500 text-sm">{movie.year}</p>

            <button
              onClick={() => movie._id && deleteMovie(movie._id)}
              className="text-red-500 hover:text-red-700 text-sm mt-2"
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>

      {/* ➕ Add Movie */}
      <div className="flex flex-wrap justify-center mt-6 gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="border rounded-lg p-2"
        />
        <input
          type="number"
          placeholder="Rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded-lg p-2"
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-lg p-2"
        />
        <button
          onClick={addMovie}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Add Movie
        </button>
      </div>

      {/* 🎲 Recommend Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={recommendMovie}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          🎲 Recommend Me a Movie
        </button>
      </div>

      {/* ✨ Recommendation */}
      {recommendation && (
        <div className="text-center mt-6">
          <h2 className="text-xl font-semibold mb-2">✨ Your Recommendation:</h2>
          <p className="text-lg">
            🎥 <b>{recommendation.title}</b> ({recommendation.year}) —{" "}
            {recommendation.genre} ⭐ {recommendation.rating}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
