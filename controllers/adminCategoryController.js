const Category = require("../models/Category");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendResponse } = require("../middleware/responseMiddleware");
const fs = require("fs/promises");
const path = require("path");
const { default: makeFullUrl } = require("../utils/makeFullUrl");

/* ------------------------------------------------------------------ */
/*  Config / helpers                                                   */
/* ------------------------------------------------------------------ */

const BASE_UPLOAD_DIR = "/uploads/category-images";

/**
 * deleteImageFile – Removes a file from disk.
 * Accepts either a relative path (/uploads/…) or a full URL.
 */
const deleteImageFile = async (imgUrlOrPath) => {
  if (!imgUrlOrPath) return;

  try {
    // strip protocol & host if present
    const relPath = imgUrlOrPath.replace(/^https?:\/\/[^/]+/, "");
    const fullPath = path.join(__dirname, "..", relPath);
    await fs.unlink(fullPath);
  } catch (err) {
    console.error("Failed to delete image:", imgUrlOrPath, err.message);
  }
};

/* ------------------------------------------------------------------ */
/*  Controller actions                                                 */
/* ------------------------------------------------------------------ */

// @desc  Create a new category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, parent, description, metaTitle, metaDescription } =
      req.body;

    if (!name) {
      if (req.file)
        await deleteImageFile(`${BASE_UPLOAD_DIR}/${req.file.filename}`);
      return next(new BadRequestError("Category name is required"));
    }

    const relativeImagePath = req.file
      ? `${BASE_UPLOAD_DIR}/${req.file.filename}`
      : undefined;

    const category = await Category.create({
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/\s+/g, "-"),
      parent: parent || null,
      description,
      metaTitle,
      metaDescription,
      image: relativeImagePath,
    });

    // send full URL to client
    const data = category.toObject();
    data.image = makeFullUrl(data.image);

    sendResponse(res, 201, "Category created", data);
  } catch (err) {
    if (req.file)
      await deleteImageFile(`${BASE_UPLOAD_DIR}/${req.file.filename}`);
    next(err);
  }
};

// @desc  Get all categories (with product count)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "categories",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
    ]);

    // Populate parent field (for tree view)
    const populated = await Category.populate(categories, {
      path: "parent",
      select: "name",
    });

    // convert image paths to full URLs
    const data = populated.map((c) => ({
      ...c,
      image: makeFullUrl(c.image),
    }));

    sendResponse(res, 200, "Categories fetched", data);
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parent",
      "name"
    );
    if (!category) return next(new NotFoundError("Category not found"));

    const data = category.toObject();
    data.image = makeFullUrl(data.image);

    sendResponse(res, 200, "Category fetched", data);
  } catch (err) {
    next(err);
  }
};

// @desc  Update a category
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      if (req.file)
        await deleteImageFile(`${BASE_UPLOAD_DIR}/${req.file.filename}`);
      return next(new NotFoundError("Category not found"));
    }

    const { name, slug, parent, description, metaTitle, metaDescription } =
      req.body;

    if (name) category.name = name.trim();
    if (slug) category.slug = slug;
    if (parent !== undefined) category.parent = parent || null;
    if (description !== undefined) category.description = description;
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      category.metaDescription = metaDescription;

    if (req.file) {
      // remove previous image if present
      if (category.image) await deleteImageFile(category.image);
      category.image = `${BASE_UPLOAD_DIR}/${req.file.filename}`;
    }

    await category.save();

    const data = category.toObject();
    data.image = makeFullUrl(data.image);

    sendResponse(res, 200, "Category updated", data);
  } catch (err) {
    if (req.file)
      await deleteImageFile(`${BASE_UPLOAD_DIR}/${req.file.filename}`);
    next(err);
  }
};

// @desc  Delete a category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new NotFoundError("Category not found"));

    const childExists = await Category.exists({ parent: req.params.id });
    if (childExists) {
      return next(
        new BadRequestError(
          "Cannot delete this category because it has child categories. Please reassign or delete them first."
        )
      );
    }

    if (category.image) await deleteImageFile(category.image);

    await category.deleteOne();

    sendResponse(res, 200, "Category deleted");
  } catch (err) {
    next(err);
  }
};
