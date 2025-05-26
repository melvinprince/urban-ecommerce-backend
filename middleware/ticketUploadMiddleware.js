// backend/middleware/ticketUploadMiddleware.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const TICKET_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tickets");
if (!fs.existsSync(TICKET_UPLOAD_DIR)) {
  fs.mkdirSync(TICKET_UPLOAD_DIR, { recursive: true });
}

// Multer storage config for tickets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TICKET_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter (validate file types: images, pdf, video)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/quicktime",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and videos are allowed."
      ),
      false
    );
  }
};

// 20MB max per file
const uploadTicketFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = {
  uploadTicketFiles,
};
