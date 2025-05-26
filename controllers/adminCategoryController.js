// backend/controllers/adminCategoryController.js

const Category = require("../models/Category");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendResponse } = require("../middleware/responseMiddleware");
const fs = require("fs/promises");
const path = require("path");

// Helper: Delete image from disk
const deleteImageFile = async (imgPath) => {
  try {
    const fullPath = path.join(__dirname, "..", imgPath);
    await fs.unlink(fullPath);
  } catch (err) {
    console.error("Failed to delete image:", imgPath, err.message);
  }
};

// @desc Create a new category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, parent, description } = req.body;
    if (!name) {
      if (req.file)
        await deleteImageFile(`/uploads/category-images/${req.file.filename}`);
      return next(new BadRequestError("Category name is required"));
    }

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      parent: parent || null,
      description,
      image: req.file
        ? `/uploads/category-images/${req.file.filename}`
        : undefined,
    });

    sendResponse(res, 201, "Category created", category);
  } catch (err) {
    if (req.file)
      await deleteImageFile(`/uploads/category-images/${req.file.filename}`);
    next(err);
  }
};

// @desc Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("parent", "name");
    sendResponse(res, 200, "Categories fetched", categories);
  } catch (err) {
    next(err);
  }
};

// @desc Get a single category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parent",
      "name"
    );
    if (!category) return next(new NotFoundError("Category not found"));
    sendResponse(res, 200, "Category fetched", category);
  } catch (err) {
    next(err);
  }
};

// @desc Update a category
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      if (req.file)
        await deleteImageFile(`/uploads/category-images/${req.file.filename}`);
      return next(new NotFoundError("Category not found"));
    }

    const { name, slug, parent, description } = req.body;
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (parent !== undefined) category.parent = parent || null;
    if (description !== undefined) category.description = description;

    if (req.file) {
      if (category.image) await deleteImageFile(category.image);
      category.image = `/uploads/category-images/${req.file.filename}`;
    }

    await category.save();
    sendResponse(res, 200, "Category updated", category);
  } catch (err) {
    if (req.file)
      await deleteImageFile(`/uploads/category-images/${req.file.filename}`);
    next(err);
  }
};

// @desc Delete a category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new NotFoundError("Category not found"));

    if (category.image) {
      await deleteImageFile(category.image);
    }

    sendResponse(res, 200, "Category deleted");
  } catch (err) {
    next(err);
  }
};
