const express = require("express");
const multer = require("multer");
const {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
} = require("../controllers/ticketController");
const auth = require("../middleware/auth");
const { ticketRules } = require("../validators/ticketValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");

// Multer memory storage for initial upload into buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const router = express.Router();

// Submit new ticket
router.post(
  "/",
  auth,
  upload.array("files", 3),
  ticketRules(),
  handleValidationErrors,
  createTicket
);

// List all tickets for logged-in user
router.get("/my-tickets", auth, getMyTickets);

// View specific ticket
router.get("/:id", auth, getTicketById);

// Reply to a ticket (user or admin)
router.patch("/:id/reply", auth, upload.array("files", 3), replyToTicket);

module.exports = router;
