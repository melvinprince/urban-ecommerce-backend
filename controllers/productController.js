const Product = require("../models/Product");
const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware"); // ⬅️ Import the helper

// @desc    Fetch products (with optional category filter, pagination, sorting)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category: slug,
      page = 1,
      limit = 20,
      sort = "createdAt:desc",
      priceMin,
      priceMax,
      search,
    } = req.query;

    const filter = { isActive: true };

    if (slug) {
      const cat = await Category.findOne({ slug }).lean();
      if (!cat) {
        res.status(404);
        throw new Error("Category not found");
      }
      filter.categories = cat._id;
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [sortField, sortOrder] = sort.split(":");
    const sortOption = { [sortField]: sortOrder === "asc" ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select("title slug price discountPrice images shortDescription")
      .lean();

    sendResponse(res, 200, "Products fetched successfully", {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate("categories", "name slug")
      .lean();

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    sendResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    next(error);
  }
};
