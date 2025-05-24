// backend/controllers/couponController.js
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// POST /api/coupons/apply
exports.applyCoupon = async (req, res, next) => {
  const { code, subtotal, email } = req.body;
  const userId = req.user?.id;
  const now = new Date();

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid coupon code." });
  }

  // Date validity
  if (now < coupon.startDate || now > coupon.expiryDate) {
    return res
      .status(400)
      .json({ success: false, message: "Coupon is not active." });
  }

  // Global usage limit
  if (coupon.usedCount >= coupon.usageLimit) {
    return res
      .status(400)
      .json({ success: false, message: "Coupon usage limit reached." });
  }

  // Check if user has already used it
  if (
    userId &&
    coupon.usersUsed.map((id) => id.toString()).includes(userId.toString())
  ) {
    return res
      .status(400)
      .json({ success: false, message: "You have already used this coupon." });
  }

  if (
    !userId &&
    email &&
    coupon.emailsUsed.map((e) => e.toLowerCase()).includes(email.toLowerCase())
  ) {
    return res.status(400).json({
      success: false,
      message: "This email has already used the coupon.",
    });
  }

  // Minimum subtotal
  if (subtotal < coupon.minSubtotal) {
    return res.status(400).json({
      success: false,
      message: `Minimum subtotal is ${coupon.minSubtotal}.`,
    });
  }

  // Calculate discount
  let discount =
    coupon.type === "percentage"
      ? (subtotal * coupon.value) / 100
      : coupon.value;
  discount = Math.min(discount, subtotal);

  res.json({
    success: true,
    message: "Coupon applied.",
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    },
  });
};

// Called within your order-placement logic
exports.redeemCoupon = async ({ code, userId, email }) => {
  // Atomically bump usage and record user/email
  await Coupon.findOneAndUpdate(
    { code },
    {
      $inc: { usedCount: 1 },
      ...(userId
        ? { $addToSet: { usersUsed: new mongoose.Types.ObjectId(userId) } }
        : { $addToSet: { emailsUsed: email } }),
    }
  );
};
