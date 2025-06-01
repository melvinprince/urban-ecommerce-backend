const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1 },
  size: String,
  color: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total number of items
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

// Virtual: subtotal (skip any item where i.product is null)
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, i) => {
    // If product didn’t populate (i.product is null), skip it
    if (!i.product || typeof i.product.price !== "number") {
      return sum;
    }
    return sum + i.quantity * i.product.price;
  }, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
