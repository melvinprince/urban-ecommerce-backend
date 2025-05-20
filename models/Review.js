// backend/models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // verification
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
