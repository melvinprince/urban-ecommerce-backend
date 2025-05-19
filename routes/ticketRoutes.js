const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
} = require("../controllers/ticketController");

const auth = require("../middleware/auth");

// === Multer Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tickets/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substr(2)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "video/mp4",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// === Routes ===

// 📬 Submit new ticket
router.post("/", auth, upload.array("files", 3), createTicket);

// 📄 List all tickets for logged-in user
router.get("/my-tickets", auth, getMyTickets);

// 🔍 View specific ticket
router.get("/:id", auth, getTicketById);

// 💬 Reply to a ticket (user or admin)
router.patch("/:id/reply", auth, upload.array("files", 3), replyToTicket);

module.exports = router;
