// models/Category.js
// Stores product categories (e.g. “Men’s Apparel”, “Women’s Footwear”, “Kids (3+) Apparel”)

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true, // used in URLs, e.g. /category/mens-apparel
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // for top‐level categories
    },
    image: {
      type: String, // optional banner or icon URL
    },
    description: {
      type: String, // optional long description
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
