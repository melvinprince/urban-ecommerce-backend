const express = require("express");
const router = express.Router();
const {
  applyCoupon,
  redeemCoupon,
} = require("../controllers/couponController");
const authOptional = require("../middleware/authOptional");

router.post("/apply", authOptional, applyCoupon);
router.post("/update-order", redeemCoupon);

module.exports = router;
