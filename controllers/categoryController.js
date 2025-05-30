// controllers/categoryController.js

const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware");
const { InternalServerError } = require("../utils/errors");

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .select("name slug parent image description metaTitle metaDescription")
      .sort({ name: 1 });

    sendResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    next(new InternalServerError("Failed to fetch categories", error));
  }
};
