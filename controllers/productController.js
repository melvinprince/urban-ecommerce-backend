const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Fetch products (with optional category filter, pagination, sorting)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  const {
    category: slug,
    page = 1,
    limit = 20,
    sort = "createdAt:desc",
    priceMin,
    priceMax,
    search,
  } = req.query;

  // Build filter
  const filter = { isActive: true };

  if (slug) {
    const cat = await Category.findOne({ slug }).lean();
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
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

  // Parse sort param (e.g. "price:asc" or "createdAt:desc")
  const [sortField, sortOrder] = sort.split(":");
  const sortOption = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  const skip = (Number(page) - 1) * Number(limit);

  // Count total for pagination meta
  const total = await Product.countDocuments(filter);

  // Fetch products
  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .select("title slug price discountPrice images shortDescription")
    .lean();

  res.json({
    success: true,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
    data: products,
  });
};

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true })
    .populate("categories", "name slug")
    .lean();

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
};
