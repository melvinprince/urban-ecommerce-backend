// backend/routes/adminCouponRoutes.js

const express = require("express");
const adminCouponController = require("../controllers/adminCouponController");

const router = express.Router();

// Create a new coupon
router.post("/", adminCouponController.createCoupon);

// Get all coupons
router.get("/", adminCouponController.getAllCoupons);

// Get a single coupon by ID
router.get("/:id", adminCouponController.getCouponById);

// Update a coupon
router.put("/:id", adminCouponController.updateCoupon);

// Delete a coupon
router.delete("/:id", adminCouponController.deleteCoupon);

module.exports = router;
