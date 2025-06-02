const { sendResponse } = require("../middleware/responseMiddleware");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");
const Cart = require("../models/Cart");
const Product = require("../models/Product"); // ← we need this to verify productId

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    if (!req.user) {
      // No user means authentication middleware was never applied
      return next(
        new UnauthorizedError("You must be logged in to view the cart")
      );
    }

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
    console.error("🔥 [getCart] caught exception:", error);
    next(error);
  }
};

// POST /api/cart
exports.addOrUpdateCart = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new UnauthorizedError("You must be logged in to modify the cart")
      );
    }

    const userId = req.user._id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return next(new BadRequestError("Product ID is required"));
    }

    // 1) Verify that the product actually exists
    const product = await Product.findById(productId);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    // 2) Find or create the cart for this user
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 3) Check if this product+size+color already exists in cart
    const idx = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (size ? item.size === size : true) &&
        (color ? item.color === color : true)
    );

    if (idx > -1) {
      // Update quantity
      cart.items[idx].quantity += quantity;

      if (cart.items[idx].quantity < 1) {
        cart.items.splice(idx, 1);
        console.log(
          `🗑️ [addOrUpdateCart] Quantity < 1 → removed item at idx ${idx}`
        );
      }
    } else {
      // Push new line item (and also store price snapshot if needed)

      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
      });
    }

    // 4) Save the cart
    await cart.save();

    // 5) Re‐populate so we get full product details
    await cart.populate({
      path: "items.product",
      select: "title slug images price discountPrice sizes colors stock",
    });

    // 6) Send response
    sendResponse(res, 200, "Cart updated successfully", {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("🔥 [addOrUpdateCart] caught exception:", error);
    next(error);
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new UnauthorizedError("You must be logged in to modify the cart")
      );
    }

    const userId = req.user._id;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new NotFoundError("Cart not found"));
    }

    const initialCount = cart.items.length;
    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);

    if (cart.items.length === initialCount) {
      return next(new NotFoundError("Cart item not found"));
    }

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
    console.error("🔥 [removeCartItem] caught exception:", error);
    next(error);
  }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new UnauthorizedError("You must be logged in to modify the cart")
      );
    }

    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new NotFoundError("Cart not found"));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return next(new NotFoundError("Cart item not found"));
    }

    if (quantity != null) {
      item.quantity = quantity;
    }
    if (size != null) {
      item.size = size;
    }
    if (color != null) {
      item.color = color;
    }

    if (item.quantity < 1) {
      cart.items.id(itemId).remove();
    }

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
    console.error("🔥 [updateCartItem] caught exception:", error);
    next(error);
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new UnauthorizedError("You must be logged in to clear the cart")
      );
    }

    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new NotFoundError("Cart not found"));
    }

    cart.items = [];
    await cart.save();

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
    console.error("🔥 [clearCart] caught exception:", error);
    next(error);
  }
};
