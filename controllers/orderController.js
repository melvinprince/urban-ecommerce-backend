const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendResponse } = require("../middleware/responseMiddleware");
const { redeemCoupon } = require("./couponController");

exports.createOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod, isPaid, totalAmount, couponCode } =
      req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("No items to order");
    }

    let customOrderId;
    let isUnique = false;
    while (!isUnique) {
      customOrderId = Math.floor(100000 + Math.random() * 900000);
      const existing = await Order.findOne({ customOrderId });
      if (!existing) isUnique = true;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let couponSnapshot = null;
    if (couponCode) {
      const couponDoc = await Coupon.findOne({ code: couponCode });
      if (!couponDoc) {
        res.status(404);
        throw new Error("Coupon not found");
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

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "title price images slug")
      .populate("user", "name email");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (
      order.user &&
      req.user &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

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

exports.getOrderByCustomId = async (req, res, next) => {
  try {
    const customOrderId = parseInt(req.params.customId);
    const order = await Order.findOne({ customOrderId })
      .populate("items.product", "title price images slug")
      .populate("user", "name email");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    sendResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

exports.getOrdersByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const orders = await Order.find({ "address.email": email })
      .sort({ createdAt: -1 })
      .select("-__v")
      .populate("items.product", "title price images slug");

    if (!orders.length) {
      res.status(404);
      throw new Error("No orders found for this email");
    }

    sendResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { customOrderId } = req.params;
    const order = await Order.findOne({ customOrderId });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (
      order.user &&
      req.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to cancel this order");
    }

    if (!order.canModify || order.status === "shipped") {
      res.status(400);
      throw new Error("Order can no longer be cancelled");
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

exports.cancelOrderAsGuest = async (req, res, next) => {
  try {
    const { customOrderId, email } = req.body;

    if (!customOrderId || !email) {
      res.status(400);
      throw new Error("Order ID and email are required");
    }

    const order = await Order.findOne({ customOrderId });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.address.email !== email) {
      res.status(403);
      throw new Error("Email does not match order record");
    }

    if (!order.canModify || order.status === "shipped") {
      res.status(400);
      throw new Error("Order can no longer be cancelled");
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

exports.editOrder = async (req, res, next) => {
  try {
    const { customId } = req.params;
    const { address, email } = req.body;

    const order = await Order.findOne({ customOrderId: customId });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (!order.canModify || order.status === "shipped") {
      res.status(400);
      throw new Error("Order can no longer be modified");
    }

    if (req.user) {
      if (order.user && order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to edit this order");
      }
    } else {
      if (!email || email !== order.address?.email) {
        res.status(403);
        throw new Error("Email verification failed");
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
