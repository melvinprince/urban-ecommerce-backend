// backend/controllers/adminProductController.js

const Product = require("../models/Product");
const Category = require("../models/Category");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendResponse } = require("../middleware/responseMiddleware");
const fs = require("fs/promises");
const path = require("path");

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
    const { title, price, description, categories } = req.body;
    if (!title || !price || !categories) {
      await deleteUploadedFiles(req.files || []);
      return next(
        new BadRequestError("Title, price, and categories are required")
      );
    }

    const images =
      req.files?.map((file) => `/uploads/product-images/${file.filename}`) ||
      [];

    const newProduct = await Product.create({
      ...req.body,
      price: Number(price),
      images,
      categories: Array.isArray(categories) ? categories : [categories],
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
    const { title, price, categories } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      await deleteUploadedFiles(req.files || []);
      return next(new NotFoundError("Product not found"));
    }

    // Basic validation
    if (title) product.title = title;
    if (price) product.price = Number(price);
    if (categories) {
      product.categories = Array.isArray(categories)
        ? categories
        : [categories];
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/product-images/${file.filename}`
      );
      product.images = newImages;
    }

    // Update other fields dynamically
    for (const key in req.body) {
      if (!["title", "price", "categories"].includes(key)) {
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

    // Optional: Delete product images from disk (if not using cloud)
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
