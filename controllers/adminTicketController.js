// backend/controllers/adminTicketController.js

const Ticket = require("../models/Ticket");
const { sendResponse } = require("../middleware/responseMiddleware");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

// Helper: Delete file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(path.join(__dirname, "..", filePath));
  } catch (err) {
    console.error("Failed to delete file:", filePath, err.message);
  }
};

const detectMagicType = (buffer) => {
  const hex = buffer.slice(0, 4).toString("hex").toLowerCase();
  if (hex.startsWith("ffd8ff") || hex.startsWith("89504e47")) return "image";
  if (hex.startsWith("25504446")) return "pdf";
  if (hex.startsWith("00000018") || buffer.slice(4, 12).toString() === "ftyp")
    return "video";
  return null;
};

// Get all tickets
exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    sendResponse(res, 200, "Tickets fetched", tickets);
  } catch (err) {
    next(err);
  }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!ticket) return next(new NotFoundError("Ticket not found"));
    sendResponse(res, 200, "Ticket fetched", ticket);
  } catch (err) {
    next(err);
  }
};

// Reply to a ticket (admin)
exports.replyToTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    console.log("Ticket ID:", req.params.id);

    if (!ticket) return next(new NotFoundError("Ticket not found"));

    const { message } = req.body;
    console.log("Message:", message);

    if (!message || !message.trim()) {
      return next(new BadRequestError("Message cannot be empty"));
    }
    const attachments = [];
    for (const file of req.files || []) {
      console.log("Processing file:", file.originalname);

      const localFilePath = path.join("uploads", "tickets", file.filename);
      const absoluteFilePath = path.join(__dirname, "..", localFilePath);
      const fileBuffer = await fs.readFile(absoluteFilePath);
      const fileType = detectMagicType(fileBuffer);

      if (!fileType) {
        await fs.unlink(absoluteFilePath);
        return next(
          new BadRequestError(`Invalid file type: ${file.originalname}`)
        );
      }

      const fileUrl = `${process.env.BACKEND_URL}/${localFilePath.replace(
        /\\/g,
        "/"
      )}`;

      attachments.push({
        url: fileUrl,
        type: fileType,
      });
    }

    ticket.messages.push({
      sender: "admin",
      text: message,
      attachments,
    });

    ticket.status = "replied";

    await ticket.save();
    sendResponse(res, 200, "Reply added", ticket);
  } catch (err) {
    next(err);
  }
};

// Update ticket status (close/reopen)
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return next(new NotFoundError("Ticket not found"));

    if (!["open", "replied", "closed"].includes(status)) {
      return next(new BadRequestError("Invalid status"));
    }

    ticket.status = status;
    await ticket.save();

    sendResponse(res, 200, `Ticket status updated to ${status}`, ticket);
  } catch (err) {
    next(err);
  }
};

// Delete a specific message from a ticket (optional moderation)
exports.deleteTicketMessage = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return next(new NotFoundError("Ticket not found"));

    const index = parseInt(req.params.messageIndex, 10);
    if (isNaN(index) || index < 0 || index >= ticket.messages.length) {
      return next(new BadRequestError("Invalid message index"));
    }

    const [removedMessage] = ticket.messages.splice(index, 1);

    for (const attachment of removedMessage.attachments || []) {
      await deleteFile(attachment.url);
    }

    await ticket.save();
    sendResponse(res, 200, "Message deleted from ticket", ticket);
  } catch (err) {
    next(err);
  }
};
