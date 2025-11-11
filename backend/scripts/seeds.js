import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "../models/Article.js";
import User from "../models/User.js";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/blog"
    );
    console.log("Connected to MongoDB");

    await Article.deleteMany({});
    await User.deleteMany({});
    const adminUser = new User({
      username: "admin",
      password: "password",
    });
    await adminUser.save();
    console.log("Created admin user (username: admin, password: password)");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
