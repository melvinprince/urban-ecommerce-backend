// controllers/wishlistController.js

const Wishlist = require("../models/wishlist");

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
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

    return res.json({ success: true, data: wishlist.items });
  } catch (err) {
    console.error("wishlistController.getWishlist:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/wishlist
// Add a product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // prevent duplicates
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

    return res.json({ success: true, data: wishlist.items });
  } catch (err) {
    console.error("wishlistController.addToWishlist:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/wishlist/:itemId
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.json({ success: true, data: [] });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item._id.toString() !== itemId
    );
    await wishlist.save();
    await wishlist.populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    return res.json({ success: true, data: wishlist.items });
  } catch (err) {
    console.error("wishlistController.removeFromWishlist:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/wishlist/clear
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    console.error("wishlistController.clearWishlist:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
