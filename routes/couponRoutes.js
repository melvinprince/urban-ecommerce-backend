const express = require("express");
const router = express.Router();

const {
  applyCoupon,
  redeemCoupon,
} = require("../controllers/couponController");

const authOptional = require("../middleware/authOptional");

const { applyCouponRules } = require("../validators/couponValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");

// User applies a coupon during checkout
router.post(
  "/apply",
  authOptional,
  applyCouponRules(),
  handleValidationErrors,
  applyCoupon
);

// Internal use (adjusted totals after applying coupon)
router.post("/update-order", redeemCoupon);

module.exports = router;
