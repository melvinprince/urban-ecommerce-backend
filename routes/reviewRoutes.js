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

router.post("/", auth, reviewRules(), handleValidationErrors, createReview);
router.get("/:productId", getProductReviews);

module.exports = router;
