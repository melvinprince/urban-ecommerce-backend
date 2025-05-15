// controllers/cartController.js

const Cart = require("../models/Cart");

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
      await cart.populate({
        path: "items.product",
        select: "title slug images price discountPrice",
      });
    }

    return res.json({
      success: true,
      data: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error("cartController.getCart:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/cart
exports.addOrUpdateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    // find existing item
    const idx = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (size ? item.size === size : true) &&
        (color ? item.color === color : true)
    );

    if (idx > -1) {
      cart.items[idx].quantity += quantity;
      if (cart.items[idx].quantity < 1) {
        cart.items.splice(idx, 1);
      }
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    return res.json({
      success: true,
      data: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error("cartController.addOrUpdateCart:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ success: true, data: [] });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    return res.json({
      success: true,
      data: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error("cartController.removeCartItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    if (quantity != null) item.quantity = quantity;
    if (size != null) item.size = size;
    if (color != null) item.color = color;
    if (item.quantity < 1) cart.items.id(itemId).remove();

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice",
    });

    return res.json({
      success: true,
      data: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error("cartController.updateCartItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
