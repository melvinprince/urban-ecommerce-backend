const express = require("express");
const router = express.Router();
const {
  applyCoupon,
  redeemCoupon,
} = require("../controllers/couponController");
const authOptional = require("../middleware/authOptional");

// Apply coupon with optional authentication
router.post("/apply", authOptional, applyCoupon);

// (If you call redeemCoupon as a route — but usually it's called from order controller)
router.post("/update-order", redeemCoupon);

module.exports = router;
