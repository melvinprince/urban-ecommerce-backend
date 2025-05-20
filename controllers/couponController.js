// backend/controllers/couponController.js
const Coupon = require("../models/Coupon");

exports.applyCoupon = async (req, res, next) => {
  const { code, subtotal } = req.body;
  const now = new Date();

  const coupon = await Coupon.findOne({ code });
  if (!coupon)
    return res.status(404).json({ success: false, message: "Invalid code." });

  if (now < coupon.startDate || now > coupon.expiryDate)
    return res
      .status(400)
      .json({ success: false, message: "Coupon expired or not active." });

  if (coupon.usedCount >= coupon.usageLimit)
    return res
      .status(400)
      .json({ success: false, message: "Usage limit reached." });

  if (subtotal < coupon.minSubtotal)
    return res.status(400).json({
      success: false,
      message: `Minimum cart value is ${coupon.minSubtotal}.`,
    });

  // compute discount
  let discount =
    coupon.type === "percentage"
      ? (subtotal * coupon.value) / 100
      : coupon.value;

  // cap discount so it doesn’t exceed subtotal
  discount = Math.min(discount, subtotal);

  res.json({
    success: true,
    message: "Coupon applied!",
    data: { code, type: coupon.type, value: coupon.value, discount },
  });
};

exports.incrementUsage = async (req, res, next) => {
  // call this when order is finalized
  const { code } = req.body;
  await Coupon.findOneAndUpdate({ code }, { $inc: { usedCount: 1 } });
  next();
};
