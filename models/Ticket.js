// models/Ticket.js
// Customer support tickets and admin/user conversation thread

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    initialMessage: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "InProgress", "Closed"],
      default: "Open",
    },
    conversation: [messageSchema], // subsequent replies
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
