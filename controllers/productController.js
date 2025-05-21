const Product = require("../models/Product");
const Category = require("../models/Category");
const { sendResponse } = require("../middleware/responseMiddleware"); // ⬅️ Import the helper

// @desc    Fetch products (with optional category filter, pagination, sorting)
// @route   GET /api/products
// @access  Public

exports.getProducts = async (req, res, next) => {
  try {
    const {
      category, // can be single slug or comma-list
      size,
      color,
      priceMin,
      priceMax,
      sort = "createdAt:desc", // newest default
      page = 1,
      limit = 20,
      search,
    } = req.query;

    /* helper: normalise list-style query values */
    const toList = (v) =>
      Array.isArray(v)
        ? v
        : typeof v === "string"
        ? v.split(",").filter(Boolean)
        : [];

    /* ───────── building filter ───────── */
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

    // simple keyword search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    /* ───────── sort mapping ───────── */
    let sortOption = { createdAt: -1 }; // newest default
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
      case "createdAt:asc":
      case "createdAt:desc":
        const [f, dir] = sort.split(":");
        sortOption = { [f]: dir === "asc" ? 1 : -1 };
        break;
      default:
        // keep default newest
        break;
    }

    const skip = (Number(page) - 1) * Number(limit);

    /* ───────── query & response ───────── */
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select("title slug price discountPrice images shortDescription")
        .lean(),
    ]);

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

    console.log("🔍 [API] Search query received:", req.query);

    const filter = { isActive: true };

    // Apply text search if query string is valid
    if (typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");

      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];

      console.log("✅ Applied RegExp filter:", regex);
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
      console.log("🔍 Category documents found:", catDocs);
      if (ids.length > 0) {
        filter.categories = { $in: ids };
        console.log("✅ Filter: category IDs =", ids);
      } else {
        console.log("⚠️ No matching category slugs found:", slugs);
      }
    }

    // SIZE filter (normalized to uppercase)
    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      const normalized = sizes.map((s) => s.toUpperCase());
      filter.sizes = { $in: normalized };
      console.log("✅ Filter: sizes =", normalized);
    }

    // COLOR filter (capitalize first letter)
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      const normalized = colors.map(
        (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
      );
      filter.colors = { $in: normalized };
      console.log("✅ Filter: colors =", normalized);
    }

    // PRICE RANGE filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) {
        filter.price.$gte = parseFloat(priceMin);
        console.log("✅ Filter: priceMin =", priceMin);
      }
      if (priceMax) {
        filter.price.$lte = parseFloat(priceMax);
        console.log("✅ Filter: priceMax =", priceMax);
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

    // Final filter debug
    console.log("🧪 Final Mongo Filter:", JSON.stringify(filter, null, 2));
    console.log(
      "⚙️ Sort Option:",
      sortOption,
      " | Page:",
      page,
      " | Limit:",
      limit
    );

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

    console.log(`✅ Products fetched: ${products.length} / ${total}`);

    return sendResponse(res, 200, "Products fetched successfully", {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error in searchProducts:", error);
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
