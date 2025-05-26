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
      unique: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: { type: String },
    description: { type: String },

    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
