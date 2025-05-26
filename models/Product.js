const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Product title is required"] },
    slug: { type: String, required: true, unique: true, index: true },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: { type: String },
    price: { type: Number, required: [true, "Price is required"] },
    discountPrice: { type: Number, default: null },
    sku: { type: String, unique: true, sparse: true }, // sparse allows nulls

    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    stock: { type: Number, required: true, default: 0, index: true },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [], index: true },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // NEW: SEO Metadata
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Compound index for faster category-based filtering
productSchema.index({ categories: 1, price: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
