const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        size: String,
        color: String,
        price: { type: Number, required: true },
      },
    ],
    address: {
      fullName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["paypal", "cod"],
      required: true,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    totalAmount: { type: Number, required: true },

    customOrderId: {
      type: Number,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    canModify: {
      type: Boolean,
      default: true,
    },
    cancelledAt: Date,
  },

  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
