// backend/routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const { applyCoupon } = require("../controllers/couponController");

// POST /api/coupons/apply
router.post("/apply", applyCoupon);

module.exports = router;
