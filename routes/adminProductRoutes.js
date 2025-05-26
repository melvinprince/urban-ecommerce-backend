const express = require("express");
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const adminProductController = require("../controllers/adminProductController");

const router = express.Router();

// Product routes
router.post(
  "/",
  uploadProductImages.array("images", 5),
  adminProductController.createProduct
);
router.get("/", adminProductController.getAllProducts);
router.get("/:id", adminProductController.getProductById);
router.put(
  "/:id",
  uploadProductImages.array("images", 5),
  adminProductController.updateProduct
);
router.delete("/:id", adminProductController.deleteProduct);

// Review routes (linked to products)
router.get("/:id/reviews", adminProductController.getProductReviews); // ⬅️ NEW
router.delete("/reviews/:reviewId", adminProductController.deleteReview); // ⬅️ NEW

module.exports = router;
