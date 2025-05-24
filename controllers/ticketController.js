// controllers/ticketController.js

const Ticket = require("../models/Ticket");
const { sendResponse } = require("../middleware/responseMiddleware");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/errors");
const fs = require("fs/promises");
const path = require("path");

// Magic number validator
const detectMagicType = (buffer) => {
  const hex = buffer.slice(0, 4).toString("hex").toLowerCase();
  if (hex.startsWith("ffd8ff") || hex.startsWith("89504e47")) return "image";
  if (hex.startsWith("25504446")) return "pdf";
  if (hex.startsWith("00000018") || buffer.slice(4, 12).toString() === "ftyp")
    return "video";
  return null;
};

// Upload directory
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tickets");

// Save buffer to disk helper
async function saveBufferToDisk(buffer, originalName) {
  const ext = path.extname(originalName);
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substr(2)}${ext}`;
  const savePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(savePath, buffer);
  return filename;
}

// Create Ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, orderRef, message } = req.body;

    if (!subject || !message) {
      return next(new BadRequestError("Subject and message are required"));
    }

    for (const file of req.files || []) {
      const fileType = detectMagicType(file.buffer);
      if (!fileType) {
        return next(
          new BadRequestError(
            `Unsupported or invalid file type: ${file.originalname}`
          )
        );
      }
    }

    const attachments = [];
    for (const file of req.files || []) {
      const filename = await saveBufferToDisk(file.buffer, file.originalname);
      attachments.push({
        url: `/uploads/tickets/${filename}`,
        type: detectMagicType(file.buffer),
      });
    }

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

// Reply to Ticket
exports.replyToTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return next(new NotFoundError("Ticket not found"));
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return next(new BadRequestError("Message cannot be empty"));
    }

    for (const file of req.files || []) {
      const fileType = detectMagicType(file.buffer);
      if (!fileType) {
        return next(
          new BadRequestError(
            `Unsupported or invalid file type: ${file.originalname}`
          )
        );
      }
    }

    const attachments = [];
    for (const file of req.files || []) {
      const filename = await saveBufferToDisk(file.buffer, file.originalname);
      attachments.push({
        url: `/uploads/tickets/${filename}`,
        type: detectMagicType(file.buffer),
      });
    }

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

// Get user's tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    sendResponse(res, 200, "Tickets fetched", tickets);
  } catch (err) {
    next(err);
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!ticket) {
      return next(new NotFoundError("Ticket not found"));
    }

    if (
      req.user.role !== "adm" &&
      ticket.user._id.toString() !== req.user._id.toString()
    ) {
      return next(new ForbiddenError("Not authorized to view this ticket"));
    }

    sendResponse(res, 200, "Ticket fetched", ticket);
  } catch (err) {
    next(err);
  }
};
