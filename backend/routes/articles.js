import express from "express";
import { body, validationResult } from "express-validator";
import Article from "../models/Article.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const articleValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("body")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Body must be at least 10 characters"),
  body("imageUrl")
    .trim()
    .notEmpty()
    .withMessage("Image URL is required")
    .matches(/^https?:\/\/.+/)
    .withMessage("Image URL must start with http:// or https://"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("tags.*") 
    .if(body("tags").exists())
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each tag must be a non-empty string"),
];

router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const tags = await Article.distinct("tags");
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Error fetching tags" });
  }
});

router.get("/tag/:tagName", async (req, res) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const query = { tags: tagName };

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    res.status(500).json({ message: "Error fetching articles by tag" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(440).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({ message: "Error fetching article" });
  }
});

router.post("/", authenticateToken, articleValidation, async (req, res) => {
  console.log("📡 Received create article request");
  console.log("📝 Request body:", {
    title: req.body.title,
    bodyLength: req.body.body?.length,
    imageUrl: req.body.imageUrl,
    bodyPreview: req.body.body?.substring(0, 100) + "...",
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ Validation errors:", errors.array());
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { title, body, imageUrl, tags } = req.body;
    console.log("✅ Validation passed, creating article...");
    const article = new Article({
      title,
      body,
      imageUrl,
      tags: tags || [], 
    });
    
    await article.save();
    console.log("✅ Article created successfully:", article._id);

    res.status(201).json(article);
  } catch (error) {
    console.error("❌ Error creating article:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      console.error("❌ Mongoose validation errors:", validationErrors);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    res.status(500).json({
      message: "Error creating article",
      error: error.message,
    });
  }
});

router.put("/:id", authenticateToken, articleValidation, async (req, res) => {
  console.log("📡 Received update article request for ID:", req.params.id);
  console.log("📝 Update data:", {
    title: req.body.title,
    bodyLength: req.body.body?.length,
    imageUrl: req.body.imageUrl,
  });
  console.log("🏷️ Tags:", req.body.tags);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ Validation errors:", errors.array());
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { title, body, imageUrl, tags } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { title, body, imageUrl, tags: tags || [] }, 
      { new: true, runValidators: true }
    );
   
    if (!article) {
      console.error("❌ Article not found:", req.params.id);
      return res.status(404).json({ message: "Article not found" });
    }

    console.log("✅ Article updated successfully:", article._id);
    res.json(article);
  } catch (error) {
    console.error("❌ Error updating article:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({
      message: "Error updating article",
      error: error.message,
    });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  console.log("📡 Received delete article request for ID:", req.params.id);
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      console.error("❌ Article not found:", req.params.id);
      return res.status(404).json({ message: "Article not found" });
    }
    console.log("✅ Article deleted successfully:", req.params.id);
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting article:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({
      message: "Error deleting article",
      error: error.message,
    });
  }
});

export default router;