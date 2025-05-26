// backend/middleware/uploadMiddleware.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Product Images Directory
const PRODUCT_IMAGES_DIR = path.join(
  __dirname,
  "..",
  "uploads",
  "product-images"
);
ensureDir(PRODUCT_IMAGES_DIR);

// Category Images Directory
const CATEGORY_IMAGES_DIR = path.join(
  __dirname,
  "..",
  "uploads",
  "category-images"
);
ensureDir(CATEGORY_IMAGES_DIR);

// Common Storage Factory
const getStorage = (dest) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed."),
      false
    );
  }
};

// Max file size: 5MB per image
const uploadProductImages = multer({
  storage: getStorage(PRODUCT_IMAGES_DIR),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCategoryImage = multer({
  storage: getStorage(CATEGORY_IMAGES_DIR),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadProductImages,
  uploadCategoryImage,
};
