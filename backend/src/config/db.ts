import mongoose from "mongoose";

/**
 * Connects to MongoDB using Mongoose
 * @param uri MongoDB connection string
 */
export async function connectDB(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri, {
      // You can add options here if needed, like:
      // dbName: "moviesdb",
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process if connection fails
  }
}
