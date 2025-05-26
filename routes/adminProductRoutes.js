// backend/routes/adminProductRoutes.js

const express = require("express");
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const adminProductController = require("../controllers/adminProductController");

const router = express.Router();

// Create a product (with image upload support)
router.post(
  "/",
  uploadProductImages.array("images", 5), // Max 5 images per product
  adminProductController.createProduct
);

// Get all products (admin view, no filters)
router.get("/", adminProductController.getAllProducts);

// Get a single product by ID
router.get("/:id", adminProductController.getProductById);

// Update a product (with image upload support)
router.put(
  "/:id",
  uploadProductImages.array("images", 5),
  adminProductController.updateProduct
);

// Delete a product
router.delete("/:id", adminProductController.deleteProduct);

module.exports = router;
