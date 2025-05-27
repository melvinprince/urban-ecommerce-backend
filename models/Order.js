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
        size: { type: String },
        color: { type: String },
        price: { type: Number, required: true },
      },
    ],
    address: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    coupon: {
      code: { type: String },
      type: { type: String },
      value: { type: Number },
      discount: { type: Number },
    },
    totalAmount: { type: Number, required: true },
    customOrderId: { type: String, unique: true },
    canModify: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "shipped", "cancelled", "completed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
