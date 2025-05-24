// controllers/orderController.js

const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendResponse } = require("../middleware/responseMiddleware");
const { redeemCoupon } = require("./couponController");
const { generateId } = require("../utils/genertaeId");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod, isPaid, totalAmount, couponCode } =
      req.body;

    if (!items || items.length === 0) {
      return next(new BadRequestError("No items to order"));
    }

    const customOrderId = `ORD-${generateId(8)}`;

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let couponSnapshot = null;
    if (couponCode) {
      const couponDoc = await Coupon.findOne({ code: couponCode });
      if (!couponDoc) {
        return next(new NotFoundError("Coupon not found"));
      }

      let discount =
        couponDoc.type === "percentage"
          ? (subtotal * couponDoc.value) / 100
          : couponDoc.value;
      discount = Math.min(discount, subtotal);

      couponSnapshot = {
        code: couponDoc.code,
        type: couponDoc.type,
        value: couponDoc.value,
        discount,
      };
    }

    const order = await Order.create({
      user: req.user?._id,
      items,
      address,
      paymentMethod,
      isPaid,
      paidAt: isPaid ? new Date() : null,
      totalAmount,
      customOrderId,
      coupon: couponSnapshot,
    });

    if (couponSnapshot) {
      await redeemCoupon({
        code: couponCode,
        userId: req.user?._id,
        email: address.email,
      });
    }

    sendResponse(res, 201, "Order placed successfully", order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "title price images slug")
      .populate("user", "name email");

    if (!order) return next(new NotFoundError("Order not found"));

    if (
      order.user &&
      req.user &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return next(new ForbiddenError("Not authorized to view this order"));
    }

    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");
    sendResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/custom/:customId
exports.getOrderByCustomId = async (req, res, next) => {
  try {
    const { customId } = req.params;
    const order = await Order.findOne({ customOrderId: customId })
      .populate("items.product", "title price images slug")
      .populate("user", "name email");

    if (!order) return next(new NotFoundError("Order not found"));

    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/by-email/:email
exports.getOrdersByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!email) return next(new BadRequestError("Email is required"));

    const orders = await Order.find({ "address.email": email })
      .sort({ createdAt: -1 })
      .select("-__v")
      .populate("items.product", "title price images slug");

    if (!orders.length) {
      return next(new NotFoundError("No orders found for this email"));
    }

    sendResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/cancel/:customOrderId
exports.cancelOrder = async (req, res, next) => {
  try {
    const { customOrderId } = req.params;
    const order = await Order.findOne({ customOrderId });

    if (!order) return next(new NotFoundError("Order not found"));

    if (
      order.user &&
      req.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return next(new ForbiddenError("Not authorized to cancel this order"));
    }

    if (!order.canModify || order.status === "shipped") {
      return next(new BadRequestError("Order can no longer be cancelled"));
    }

    order.status = "cancelled";
    order.canModify = false;
    order.cancelledAt = new Date();
    await order.save();

    sendResponse(res, 200, "Order cancelled successfully", order);
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/cancel-guest
exports.cancelOrderAsGuest = async (req, res, next) => {
  try {
    const { customOrderId, email } = req.body;

    if (!customOrderId || !email) {
      return next(new BadRequestError("Order ID and email are required"));
    }

    const order = await Order.findOne({ customOrderId });

    if (!order) return next(new NotFoundError("Order not found"));

    if (order.address.email !== email) {
      return next(new ForbiddenError("Email does not match order record"));
    }

    if (!order.canModify || order.status === "shipped") {
      return next(new BadRequestError("Order can no longer be cancelled"));
    }

    order.status = "cancelled";
    order.canModify = false;
    order.cancelledAt = new Date();
    await order.save();

    sendResponse(res, 200, "Order cancelled successfully", order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/edit/:customId
exports.editOrder = async (req, res, next) => {
  try {
    const { customId } = req.params;
    const { address, email } = req.body;

    const order = await Order.findOne({ customOrderId: customId });
    if (!order) return next(new NotFoundError("Order not found"));

    if (!order.canModify || order.status === "shipped") {
      return next(new BadRequestError("Order can no longer be modified"));
    }

    if (req.user) {
      if (order.user && order.user.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError("Not authorized to edit this order"));
      }
    } else {
      if (!email || email !== order.address?.email) {
        return next(new ForbiddenError("Email verification failed"));
      }
    }

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
    sendResponse(res, 200, "Order updated successfully", order);
  } catch (err) {
    next(err);
  }
};
