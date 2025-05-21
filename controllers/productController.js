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

    console.log("Products fetched:", products.length);

    sendResponse(res, 200, "Products fetched successfully", products, {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
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

// Product Search Controller
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 5 } = req.query;
    console.log(`[API] Searching for products with query: ${q}`);

    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Query string is required" });
    }

    const regex = new RegExp(q, "i");

    const matchingCategories = await Category.find({ name: regex }).select(
      "_id"
    );
    const categoryIds = matchingCategories.map((cat) => cat._id);

    const allMatchedProducts = await Product.find({
      isActive: true,
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
        { categories: { $in: categoryIds } },
      ],
    }).populate("categories", "name slug");

    const scored = allMatchedProducts.map((product) => {
      let score = 0;
      if (regex.test(product.title)) score += 3;
      if (regex.test(product.description)) score += 2;
      if (product.tags?.some((tag) => regex.test(tag))) score += 2;
      if (product.categories?.some((cat) => regex.test(cat.name))) score += 1;
      return { product, score };
    });

    const sortedProducts = scored
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    const start = (page - 1) * limit;
    const paginated = sortedProducts.slice(start, start + Number(limit));

    sendResponse(res, 200, "Products fetched successfully", {
      products: paginated,
      total: sortedProducts.length,
      page: Number(page),
      pages: Math.ceil(sortedProducts.length / limit),
    });
  } catch (err) {
    next(err);
  }
};
