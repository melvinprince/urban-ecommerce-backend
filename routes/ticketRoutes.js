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

router.post(
  "/",
  auth,
  upload.array("files", 3),
  ticketRules(),
  handleValidationErrors,
  createTicket
);
router.get("/my-tickets", auth, getMyTickets);
router.get("/:id", auth, getTicketById);
router.patch("/:id/reply", auth, upload.array("files", 3), replyToTicket);

module.exports = router;
