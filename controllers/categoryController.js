const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware");
const { InternalServerError } = require("../utils/errors");
const makeFullUrl = require("../utils/makeFullUrl");

/**
 * GET /api/categories
 * Returns all categories sorted alphabetically, with parent name populated
 * and image paths converted to absolute URLs.
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    // lean() returns plain JS objects → faster & easy to mutate
    const categories = await Category.find()
      .select("name slug parent image description metaTitle metaDescription")
      .sort({ name: 1 })
      .lean();

    // Ensure clients receive absolute image URLs
    const data = categories.map((c) => ({
      ...c,
      image: makeFullUrl(c.image),
    }));

    console.log("categeroies controller", data);

    sendResponse(res, 200, "Categories fetched successfully", data);
  } catch (err) {
    next(new InternalServerError("Failed to fetch categories", err));
  }
};
