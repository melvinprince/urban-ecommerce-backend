// backend/controllers/adminCouponController.js

const Coupon = require("../models/Coupon");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// @desc Create a new coupon
// @route POST /api/admin/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      minSubtotal,
      usageLimit,
      startDate,
      expiryDate,
    } = req.body;

    if (!code || !type || !value || !startDate || !expiryDate) {
      return next(
        new BadRequestError(
          "Code, type, value, startDate, and expiryDate are required"
        )
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minSubtotal: minSubtotal || 0,
      usageLimit: usageLimit || 1,
      startDate,
      expiryDate,
    });

    sendResponse(res, 201, "Coupon created", coupon);
  } catch (err) {
    next(err);
  }
};

// @desc Get all coupons
// @route GET /api/admin/coupons
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    sendResponse(res, 200, "All coupons fetched", coupons);
  } catch (err) {
    next(err);
  }
};

// @desc Get single coupon by ID
// @route GET /api/admin/coupons/:id
exports.getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return next(new NotFoundError("Coupon not found"));
    sendResponse(res, 200, "Coupon fetched", coupon);
  } catch (err) {
    next(err);
  }
};

// @desc Update a coupon
// @route PUT /api/admin/coupons/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return next(new NotFoundError("Coupon not found"));

    const {
      code,
      type,
      value,
      minSubtotal,
      usageLimit,
      startDate,
      expiryDate,
    } = req.body;

    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value) coupon.value = value;
    if (minSubtotal !== undefined) coupon.minSubtotal = minSubtotal;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (startDate) coupon.startDate = startDate;
    if (expiryDate) coupon.expiryDate = expiryDate;

    await coupon.save();
    sendResponse(res, 200, "Coupon updated", coupon);
  } catch (err) {
    next(err);
  }
};

// @desc Delete a coupon
// @route DELETE /api/admin/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new NotFoundError("Coupon not found"));

    sendResponse(res, 200, "Coupon deleted");
  } catch (err) {
    next(err);
  }
};
