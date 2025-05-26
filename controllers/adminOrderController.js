// backend/controllers/adminOrderController.js

const Order = require("../models/Order");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// @desc Get all orders (admin view)
// @route GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "title images slug");

    sendResponse(res, 200, "All orders fetched", orders);
  } catch (err) {
    next(err);
  }
};

// @desc Get single order by ID
// @route GET /api/admin/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "title images slug");

    if (!order) return next(new NotFoundError("Order not found"));

    sendResponse(res, 200, "Order fetched", order);
  } catch (err) {
    next(err);
  }
};

// @desc Update order fields (status, address, etc.)
// @route PATCH /api/admin/orders/:id
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new NotFoundError("Order not found"));

    const { status, address, paymentMethod, canModify } = req.body;

    if (status) order.status = status;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (typeof canModify !== "undefined") order.canModify = !!canModify;

    if (address) {
      order.address.fullName = address.fullName || order.address.fullName;
      order.address.email = address.email || order.address.email;
      order.address.phone = address.phone || order.address.phone;
      order.address.street = address.street || order.address.street;
      order.address.city = address.city || order.address.city;
      order.address.postalCode = address.postalCode || order.address.postalCode;
      order.address.country = address.country || order.address.country;
    }

    await order.save();
    sendResponse(res, 200, "Order updated", order);
  } catch (err) {
    next(err);
  }
};

// @desc Mark order as paid/unpaid
// @route PATCH /api/admin/orders/:id/payment
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { isPaid } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return next(new NotFoundError("Order not found"));

    order.isPaid = !!isPaid;
    order.paidAt = isPaid ? new Date() : null;

    await order.save();
    sendResponse(res, 200, "Payment status updated", order);
  } catch (err) {
    next(err);
  }
};

// @desc Cancel an order
// @route PATCH /api/admin/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new NotFoundError("Order not found"));

    if (!order.canModify || order.status === "shipped") {
      return next(new BadRequestError("Order cannot be cancelled"));
    }

    order.status = "cancelled";
    order.canModify = false;
    await order.save();

    sendResponse(res, 200, "Order cancelled", order);
  } catch (err) {
    next(err);
  }
};

// @desc Delete an order (optional)
// @route DELETE /api/admin/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next(new NotFoundError("Order not found"));

    sendResponse(res, 200, "Order deleted");
  } catch (err) {
    next(err);
  }
};
