const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware"); // ⬅️ Import helper

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    sendResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    next(error);
  }
};
