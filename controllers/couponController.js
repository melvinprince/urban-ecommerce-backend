// backend/controllers/couponController.js
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendResponse } = require("../middleware/responseMiddleware");

// POST /api/coupons/apply
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal, email } = req.body;

    const userId = req.user?.id;
    const now = new Date();

    if (!code || subtotal == null) {
      return next(new BadRequestError("Code and subtotal are required"));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return next(new NotFoundError("Invalid coupon code."));
    }

    // Date validity
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return next(new BadRequestError("Coupon is not active."));
    }

    // Global usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return next(new BadRequestError("Coupon usage limit reached."));
    }

    // Check if user has already used it
    if (
      userId &&
      coupon.usersUsed.map((id) => id.toString()).includes(userId.toString())
    ) {
      return next(new BadRequestError("You have already used this coupon."));
    }

    // Always check if email has used it (for guest or any email)
    if (
      email &&
      coupon.emailsUsed
        .map((e) => e.toLowerCase())
        .includes(email.toLowerCase())
    ) {
      return next(
        new BadRequestError("This email has already used the coupon.")
      );
    }

    // Minimum subtotal check
    if (subtotal < coupon.minSubtotal) {
      return next(
        new BadRequestError(`Minimum subtotal is ${coupon.minSubtotal}.`)
      );
    }

    // Calculate discount
    let discount =
      coupon.type === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    discount = Math.min(discount, subtotal);

    sendResponse(res, 200, "Coupon applied", {
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minSubtotal: coupon.minSubtotal,
      },
      discount,
    });
  } catch (error) {
    next(error);
  }
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
