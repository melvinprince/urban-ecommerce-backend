// models/Cart.js

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1 },
    size: String,
    color: String,
    // _id: true by default → each item gets its own id
  }
  // remove the `{ _id: false }` option here
);

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
  }
);

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce(
    (sum, i) => sum + i.quantity * (i.product.price || 0),
    0
  );
});

module.exports = mongoose.model("Cart", cartSchema);
