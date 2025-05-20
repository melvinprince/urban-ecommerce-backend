const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth"); // 👈 using your middleware

router.post("/", auth, createReview); // ✅ requires login
router.get("/:productId", getProductReviews); // ✅ public

module.exports = router;
