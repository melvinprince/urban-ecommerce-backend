const Category = require("../models/Category");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
};
