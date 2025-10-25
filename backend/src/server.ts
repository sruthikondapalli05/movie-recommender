import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; // 👈 must include .js for ESM
import movieRoutes from "./routes/movieRoutes.js"; // 👈 must include .js

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Default test route
app.get("/", (_req, res) => {
  res.send("🎬 Movie Recommendation Backend Server Running Successfully 🚀");
});

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI as string;
if (!mongoURI) {
  console.error("❌ Missing MONGO_URI in .env file");
  process.exit(1);
}
connectDB(mongoURI);

// API Routes
app.use("/api/movies", movieRoutes);

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
