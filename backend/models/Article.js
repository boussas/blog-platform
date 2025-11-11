import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      minlength: [10, "Body must be at least 10 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL (must start with http:// or https://)",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
); 
articleSchema.index({ title: "text", body: "text", tags: "text" });

const Article = mongoose.model("Article", articleSchema);

export default Article;