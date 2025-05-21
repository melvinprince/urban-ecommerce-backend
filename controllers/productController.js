const Product = require("../models/Product");
const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware"); // ⬅️ Import the helper

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

    // category slugs → ObjectIds
    if (category) {
      const slugs = toList(category);
      const catDocs = await Category.find({ slug: { $in: slugs } }).select(
        "_id"
      );
      const ids = catDocs.map((c) => c._id);
      if (ids.length) filter.categories = { $in: ids };
    }

    // price range
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    // size
    if (size) {
      const sizes = toList(size).map((s) => s.toUpperCase());
      if (sizes.length) filter.sizes = { $in: sizes };
    }

    // color
    if (color) {
      const colors = toList(color).map(
        (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
      );
      if (colors.length) filter.colors = { $in: colors };
    }

    // keyword search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    // tag-based filter
    if (tags) {
      const tagList = toList(tags);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    // discounted only filter (discountPrice < price)
    if (discountOnly === "true") {
      filter.discountPrice = { $ne: null };
    }

    // sorting
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
      default:
        break;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, rawProducts] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select("title slug price discountPrice images shortDescription")
        .lean(),
    ]);

    // Final discount validation (for discountOnly, if needed)
    const products =
      discountOnly === "true"
        ? rawProducts.filter(
            (p) => p.discountPrice !== null && p.discountPrice < p.price
          )
        : rawProducts;

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

    // Apply text search if query string is valid
    if (typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");

      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    } else {
      console.log("⚠️ No search query provided or invalid.");
    }

    // CATEGORY: Resolve slugs to IDs
    if (category) {
      const slugs = Array.isArray(category) ? category : [category];
      const catDocs = await Category.find({ slug: { $in: slugs } }).select(
        "_id"
      );
      const ids = catDocs.map((c) => c._id);
      if (ids.length > 0) {
        filter.categories = { $in: ids };
      } else {
        console.log("⚠️ No matching category slugs found:", slugs);
      }
    }

    // SIZE filter (normalized to uppercase)
    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      const normalized = sizes.map((s) => s.toUpperCase());
      filter.sizes = { $in: normalized };
    }

    // COLOR filter (capitalize first letter)
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      const normalized = colors.map(
        (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
      );
      filter.colors = { $in: normalized };
    }

    // PRICE RANGE filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) {
        filter.price.$gte = parseFloat(priceMin);
      }
      if (priceMax) {
        filter.price.$lte = parseFloat(priceMax);
      }
    }

    // Sort logic
    /* -------- SORT LOGIC -------- */
    let sortOption = { createdAt: -1 }; // default “newest”

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
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination logic
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("categories", "name slug")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return sendResponse(res, 200, "Products fetched successfully", {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required",
      });
    }

    const products = await Product.find({ _id: { $in: ids }, isActive: true })
      .select("title slug price discountPrice images shortDescription")
      .lean();

    sendResponse(res, 200, "Products fetched by IDs", products);
  } catch (error) {
    next(error);
  }
};
