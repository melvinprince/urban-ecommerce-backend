const Ticket = require("../models/Ticket");
const { sendResponse } = require("../middleware/responseMiddleware");
const fs = require("fs/promises");
const path = require("path");

// Manual magic-number validation function
const detectMagicType = (buffer) => {
  const hex = buffer.slice(0, 4).toString("hex").toLowerCase();
  if (hex.startsWith("ffd8ff") || hex.startsWith("89504e47")) return "image";
  if (hex.startsWith("25504446")) return "pdf";
  if (hex.startsWith("00000018") || buffer.slice(4, 12).toString() === "ftyp")
    return "video";
  return null;
};

// Directory to save ticket uploads
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tickets");

// Helper: save a buffer to disk and return its filename
async function saveBufferToDisk(buffer, originalName) {
  const ext = path.extname(originalName);
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substr(2)}${ext}`;
  const savePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(savePath, buffer);
  return filename;
}

// Create a ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, orderRef, message } = req.body;

    if (!subject || !message) {
      res.status(400);
      throw new Error("Subject and message are required");
    }

    // Validate magic numbers
    for (const file of req.files || []) {
      const fileType = detectMagicType(file.buffer);
      if (!fileType) {
        res.status(400);
        throw new Error(
          `Unsupported or invalid file type: ${file.originalname}`
        );
      }
    }

    // Save attachments after validation
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

// Reply to a ticket
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

    // Validate magic numbers
    for (const file of req.files || []) {
      const fileType = detectMagicType(file.buffer);
      if (!fileType) {
        res.status(400);
        throw new Error(
          `Unsupported or invalid file type: ${file.originalname}`
        );
      }
    }

    // Save attachments after validation
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

// Get all user's tickets
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
      res.status(404);
      throw new Error("Ticket not found");
    }
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
