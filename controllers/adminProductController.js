const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendResponse } = require("../middleware/responseMiddleware");
const fs = require("fs/promises");
const path = require("path");
const { getFullImageUrl } = require("../utils/fileHelper");

// Helper: Cleanup uploaded images on error
const deleteUploadedFiles = async (files) => {
  for (const file of files) {
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error("Failed to delete file:", file.path, err.message);
    }
  }
};

// @desc Create a new product
// @route POST /api/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    console.log("Creating product with data:", req.body);

    const { title, price, description, categories } = req.body;

    if (!title || !price || !categories) {
      await deleteUploadedFiles(req.files || []);
      return next(
        new BadRequestError("Title, price, and categories are required.")
      );
    }

    if (!req.files || req.files.length === 0) {
      return next(
        new BadRequestError("At least one product image is required.")
      );
    }

    const images = req.files.map((file) =>
      getFullImageUrl(`/uploads/product-images/${file.filename}`)
    );

    const newProduct = await Product.create({
      ...req.body,
      price: Number(price),
      images,
      categories: Array.isArray(categories) ? categories : [categories],
      seoKeywords: req.body.seoKeywords
        ? Array.isArray(req.body.seoKeywords)
          ? req.body.seoKeywords
          : req.body.seoKeywords.split(",").map((k) => k.trim())
        : [],
    });

    sendResponse(res, 201, "Product created successfully", newProduct);
  } catch (err) {
    await deleteUploadedFiles(req.files || []);
    next(err);
  }
};

// @desc Get all products (admin view)
// @route GET /api/admin/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("categories", "name slug");
    sendResponse(res, 200, "All products fetched", products);
  } catch (err) {
    next(err);
  }
};

// @desc Get a single product by ID
// @route GET /api/admin/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categories",
      "name slug"
    );
    if (!product) return next(new NotFoundError("Product not found"));
    sendResponse(res, 200, "Product fetched", product);
  } catch (err) {
    next(err);
  }
};

// @desc Update a product
// @route PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { title, price, categories, deletedImages } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      await deleteUploadedFiles(req.files || []);
      return next(new NotFoundError("Product not found"));
    }

    // Handle deleted images
    let imagesToDelete = [];

    if (deletedImages) {
      imagesToDelete = Array.isArray(deletedImages)
        ? deletedImages
        : [deletedImages];

      product.images = product.images.filter((img) => {
        const imgPath = new URL(img).pathname;
        const shouldDelete = imagesToDelete.some(
          (delImg) => new URL(delImg).pathname === imgPath
        );
        return !shouldDelete;
      });

      product.markModified("images");

      for (const imgPath of imagesToDelete) {
        try {
          const relativePath = new URL(imgPath).pathname;
          const filePath = path.join(__dirname, "..", relativePath);
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Failed to delete file:", imgPath, err.message);
        }
      }
    }

    // Basic fields
    if (title) product.title = title;
    if (price) product.price = Number(price);
    if (categories) {
      product.categories = Array.isArray(categories)
        ? categories
        : [categories];
    }

    // Handle SEO fields
    if (req.body.seoTitle !== undefined) product.seoTitle = req.body.seoTitle;
    if (req.body.seoDescription !== undefined)
      product.seoDescription = req.body.seoDescription;
    if (req.body.seoKeywords !== undefined) {
      product.seoKeywords = Array.isArray(req.body.seoKeywords)
        ? req.body.seoKeywords
        : req.body.seoKeywords.split(",").map((k) => k.trim());
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) =>
        getFullImageUrl(`/uploads/product-images/${file.filename}`)
      );
      product.images = [...product.images, ...newImages];
    }

    // Other fields
    for (const key in req.body) {
      if (
        ![
          "title",
          "price",
          "categories",
          "deletedImages",
          "images",
          "seoTitle",
          "seoDescription",
          "seoKeywords",
        ].includes(key)
      ) {
        product[key] = req.body[key];
      }
    }

    await product.save();
    sendResponse(res, 200, "Product updated", product);
  } catch (err) {
    await deleteUploadedFiles(req.files || []);
    next(err);
  }
};

// @desc Delete a product
// @route DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new NotFoundError("Product not found"));

    if (product.images && product.images.length > 0) {
      for (const imgPath of product.images) {
        const filePath = path.join(__dirname, "..", imgPath);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Failed to delete image file:", filePath, err.message);
        }
      }
    }

    sendResponse(res, 200, "Product deleted");
  } catch (err) {
    next(err);
  }
};

// 🆕 Get all reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return next(new NotFoundError("Product not found"));

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort("-createdAt");

    sendResponse(res, 200, "Product reviews fetched", reviews);
  } catch (err) {
    next(err);
  }
};

// 🆕 Delete a review by ID
exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return next(new NotFoundError("Review not found"));

    sendResponse(res, 200, "Review deleted");
  } catch (err) {
    next(err);
  }
};
