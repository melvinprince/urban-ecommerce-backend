const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const { reviewRules } = require("../validators/reviewValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");

// Submit a review (logged-in users only)
router.post("/", auth, reviewRules(), handleValidationErrors, createReview);

// Get all reviews for a product (public)
router.get("/:productId", getProductReviews);

module.exports = router;
