const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wishlist per user
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

// Ensure a user has only one wishlist
wishlistSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
