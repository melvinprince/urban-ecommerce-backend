// backend/routes/adminTicketRoutes.js

const express = require("express");
const { uploadTicketFiles } = require("../middleware/ticketUploadMiddleware"); // Reuse your ticket file upload logic
const adminTicketController = require("../controllers/adminTicketController");

const router = express.Router();

// Get all tickets
router.get("/", adminTicketController.getAllTickets);

// Get single ticket by ID
router.get("/:id", adminTicketController.getTicketById);

// Reply to a ticket (with optional attachments)
router.post(
  "/:id/reply",
  uploadTicketFiles.array("files", 5),
  adminTicketController.replyToTicket
);

// Close or reopen a ticket
router.patch("/:id/status", adminTicketController.updateTicketStatus);

// (Optional) Delete a ticket message
router.delete(
  "/:id/message/:messageIndex",
  adminTicketController.deleteTicketMessage
);

module.exports = router;
