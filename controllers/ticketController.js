const Ticket = require("../models/Ticket");
const { sendResponse } = require("../middleware/responseMiddleware");
const path = require("path");

// Utility to detect file type
const detectFileType = (mime) => {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime === "video/mp4") return "video";
  return "unknown";
};

// 🆕 Create ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, orderRef, message } = req.body;

    if (!subject || !message) {
      res.status(400);
      throw new Error("Subject and message are required");
    }

    const attachments = (req.files || []).map((file) => ({
      url: `/uploads/tickets/${file.filename}`,
      type: detectFileType(file.mimetype),
    }));

    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      orderRef,
      status: "open",
      messages: [
        {
          sender: "user",
          text: message,
          attachments,
        },
      ],
    });

    sendResponse(res, 201, "Ticket created", ticket);
  } catch (err) {
    next(err);
  }
};

// 🆕 Admin or user reply
exports.replyToTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found");
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400);
      throw new Error("Message cannot be empty");
    }

    const attachments = (req.files || []).map((file) => ({
      url: `/uploads/tickets/${file.filename}`,
      type: detectFileType(file.mimetype),
    }));

    const isAdmin = req.user.role === "adm";

    ticket.messages.push({
      sender: isAdmin ? "admin" : "user",
      text: message,
      attachments,
    });

    if (isAdmin) ticket.status = "replied";
    await ticket.save();

    sendResponse(res, 200, "Reply added", ticket);
  } catch (err) {
    next(err);
  }
};

// Optional: get user's own tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      console.error("❌ User not found in request");
      res.status(401);
      throw new Error("Not authorized");
    }

    console.log("✅ Fetching tickets for user:", req.user._id);

    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    sendResponse(res, 200, "Tickets fetched", tickets);
  } catch (err) {
    console.error("🔥 getMyTickets error:", err);
    next(err);
  }
};

// Optional: get full details of a ticket
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found");
    }

    // Only allow user who owns the ticket (or admin)
    if (
      req.user.role !== "adm" &&
      ticket.user._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to view this ticket");
    }

    sendResponse(res, 200, "Ticket fetched", ticket);
  } catch (err) {
    next(err);
  }
};
