const { sendResponse } = require("../middleware/responseMiddleware");
const Cart = require("../models/Cart");

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title slug images price discountPrice sizes colors stock",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
      await cart.populate({
        path: "items.product",
        select: "title slug images price discountPrice sizes colors stock",
      });
    }

    sendResponse(res, 200, "Cart fetched successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
exports.addOrUpdateCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

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
      select: "title slug images price discountPrice sizes colors stock",
    });

    sendResponse(res, 200, "Cart updated successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice sizes colors stock",
    });

    sendResponse(res, 200, "Cart item removed successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error("Cart item not found");
    }

    if (quantity != null) item.quantity = quantity;
    if (size != null) item.size = size;
    if (color != null) item.color = color;
    if (item.quantity < 1) cart.items.id(itemId).remove();

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice sizes colors stock",
    });

    sendResponse(res, 200, "Cart item updated successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Clear items and save
    cart.items = [];
    await cart.save();

    // ✅ Re-fetch the cart so virtuals recalculate correctly
    cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title slug images price discountPrice sizes colors stock",
    });

    sendResponse(res, 200, "Cart cleared successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    next(error);
  }
};
