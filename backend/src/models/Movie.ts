import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  year: { type: Number, required: true },
  poster: { type: String, default: "https://via.placeholder.com/250x350?text=No+Image" }, // cached poster URL
});

export const Movie = mongoose.model("Movie", movieSchema);
