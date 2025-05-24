// controllers/wishlistController.js

const Wishlist = require("../models/wishlist");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
      await wishlist.populate({
        path: "items.product",
        select: "title slug images price discountPrice",
      });
    }

    sendResponse(res, 200, "Wishlist fetched successfully", wishlist.items);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return next(new BadRequestError("Product ID is required"));
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const exists = wishlist.items.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({ product: productId });
      await wishlist.save();
      await wishlist.populate({
        path: "items.product",
        select: "title slug images price discountPrice",
      });
    }

    sendResponse(res, 200, "Product added to wishlist", wishlist.items);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishlist/:itemId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return next(new NotFoundError("Wishlist not found"));
    }

    wishlist.items = wishlist.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await wishlist.save();
    await wishlist.populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    sendResponse(res, 200, "Product removed from wishlist", wishlist.items);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/clear
exports.clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return next(new NotFoundError("Wishlist not found"));
    }

    wishlist.items = [];
    await wishlist.save();

    sendResponse(res, 200, "Wishlist cleared successfully", []);
  } catch (error) {
    next(error);
  }
};
