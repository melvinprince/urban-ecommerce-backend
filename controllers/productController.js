// controllers/productController.js

const Product = require("../models/Product");
const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// @desc    Fetch products (with optional category filter, pagination, sorting)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      size,
      color,
      priceMin,
      priceMax,
      sort = "createdAt:desc",
      page = 1,
      limit = 20,
      search,
      discountOnly,
      tags,
    } = req.query;

    const toList = (v) =>
      Array.isArray(v)
        ? v
        : typeof v === "string"
        ? v.split(",").filter(Boolean)
        : [];

    const filter = { isActive: true };

    if (category) {
      const slugs = toList(category);
      const catDocs = await Category.find({ slug: { $in: slugs } }).select(
        "_id"
      );
      const ids = catDocs.map((c) => c._id);
      if (ids.length) filter.categories = { $in: ids };
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (size) {
      const sizes = toList(size).map((s) => s.toUpperCase());
      if (sizes.length) filter.sizes = { $in: sizes };
    }

    if (color) {
      const colors = toList(color).map(
        (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
      );
      if (colors.length) filter.colors = { $in: colors };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    if (tags) {
      const tagList = toList(tags);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    if (discountOnly === "true") {
      filter.discountPrice = { $ne: null };
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case "priceAsc":
        sortOption = { price: 1 };
        break;
      case "priceDesc":
        sortOption = { price: -1 };
        break;
      case "popularity":
        sortOption = { "rating.count": -1 };
        break;
      case "rating":
        sortOption = { "rating.average": -1 };
        break;
      case "createdAt:asc":
      case "createdAt:desc":
        const [field, dir] = sort.split(":");
        sortOption = { [field]: dir === "asc" ? 1 : -1 };
        break;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, rawProducts] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select(
          "title slug price discountPrice images shortDescription sizes colors tags"
        )
        .populate("categories", "name slug")
        .lean(),
    ]);

    const products =
      discountOnly === "true"
        ? rawProducts.filter(
            (p) => p.discountPrice !== null && p.discountPrice < p.price
          )
        : rawProducts;

    sendResponse(res, 200, "Products fetched successfully", {
      products,
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

    if (!product) return next(new NotFoundError("Product not found"));

    sendResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      size,
      color,
      priceMin,
      priceMax,
      sort = "createdAt:desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isActive: true };

    if (typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    if (category) {
      const slugs = Array.isArray(category) ? category : [category];
      const catDocs = await Category.find({ slug: { $in: slugs } }).select(
        "_id"
      );
      const ids = catDocs.map((c) => c._id);
      if (ids.length > 0) {
        filter.categories = { $in: ids };
      }
    }

    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      filter.sizes = { $in: sizes.map((s) => s.toUpperCase()) };
    }

    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      filter.colors = {
        $in: colors.map(
          (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
        ),
      };
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case "priceAsc":
        sortOption = { price: 1 };
        break;
      case "priceDesc":
        sortOption = { price: -1 };
        break;
      case "popularity":
        sortOption = { "rating.count": -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("categories", "name slug")
        .lean(),
      Product.countDocuments(filter),
    ]);

    sendResponse(res, 200, "Products fetched successfully", {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch products by IDs (bulk fetch)
exports.getProductsByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new BadRequestError("Product IDs array is required"));
    }

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    }).lean();

    sendResponse(res, 200, "Products fetched by IDs", products);
  } catch (error) {
    next(error);
  }
};
