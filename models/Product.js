// models/Product.js
// Main product table for your custom apparel & sneakers

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true, // used in URLs, e.g. /product/olive-tee
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: {
      type: String, // shown on category/list pages
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    discountPrice: {
      type: Number, // optional sale price
      default: null,
    },
    sku: {
      type: String, // your internal code
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sizes: {
      type: [String], // e.g. ["S","M","L","XL","UK6","UK7"]
      default: [],
    },
    colors: {
      type: [String], // e.g. ["Black","Olive Green","White"]
      default: [],
    },
    images: {
      type: [String], // array of image URLs
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0, // fallback if you don’t use Inventory collection
    },
    isFeatured: {
      type: Boolean,
      default: false, // to show on homepage
    },
    isActive: {
      type: Boolean,
      default: true, // disable to hide without deleting
    },
    tags: {
      type: [String], // for search filtering
      default: [],
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
