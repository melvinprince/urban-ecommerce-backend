// backend/routes/adminCategoryRoutes.js

const express = require("express");
const { uploadCategoryImage } = require("../middleware/uploadMiddleware");
const adminCategoryController = require("../controllers/adminCategoryController");

const router = express.Router();

// Create Category (optional image upload)
router.post(
  "/",
  uploadCategoryImage.single("image"), // Single image upload
  adminCategoryController.createCategory
);

// Get All Categories (Admin View)
router.get("/", adminCategoryController.getAllCategories);

// Get Single Category by ID
router.get("/:id", adminCategoryController.getCategoryById);

// Update Category
router.put(
  "/:id",
  uploadCategoryImage.single("image"),
  adminCategoryController.updateCategory
);

// Delete Category
router.delete("/:id", adminCategoryController.deleteCategory);

module.exports = router;
