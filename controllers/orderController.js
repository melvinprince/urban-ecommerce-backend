const Order = require("../models/Order");
const { sendResponse } = require("../middleware/responseMiddleware");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Protected (optional user)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod, isPaid, totalAmount } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("No items to order");
    }

    const order = await Order.create({
      user: req.user?._id, // Optional user tracking
      items,
      address,
      paymentMethod,
      isPaid,
      paidAt: isPaid ? new Date() : null,
      totalAmount,
    });

    sendResponse(res, 201, "Order placed successfully", order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};
