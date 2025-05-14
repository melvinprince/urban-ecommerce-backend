// models/Order.js
// Tracks every purchase, its items, payment and shipping status

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: String, // snapshot of title at purchase time
    price: Number, // snapshot of price at purchase time
    quantity: Number,
    size: String,
    color: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema], // list of purchased items
    shippingAddress: {
      fullName: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "GooglePay", "ApplePay", "CashOnDelivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    trackingNumber: String, // if you integrate a courier
    invoiceUrl: String, // link to PDF invoice if generated
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
