// controllers/categoryController.js

const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware");
const { InternalServerError } = require("../utils/errors");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    sendResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    // Optional: Wrap unexpected errors in InternalServerError
    next(new InternalServerError("Failed to fetch categories", error));
  }
};
