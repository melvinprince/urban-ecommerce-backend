const Order = require("../models/Order");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// @desc Get all orders (admin view)
// @route GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, isPaid, email } = req.query;

    console.log("🔥 Filters Received:", { status, isPaid, email, page, limit });

    const match = {};

    if (status) {
      match.status = status;
      console.log("🔎 Filtering by status:", status);
    }

    if (isPaid !== undefined && isPaid !== "") {
      match.isPaid = isPaid === "true";
      console.log("🔎 Filtering by isPaid:", match.isPaid);
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (email) {
      pipeline.push({
        $match: {
          "user.email": { $regex: email, $options: "i" },
        },
      });
      console.log("🔎 Filtering by email:", email);
    }

    // Log the pipeline before aggregation
    console.log("🛠️ Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));

    const totalOrdersAgg = await Order.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    const totalOrders = totalOrdersAgg[0]?.total || 0;
    console.log("📊 Total Orders Matching Filters:", totalOrders);

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    console.log(
      "🚀 Final Pipeline with Pagination:",
      JSON.stringify(pipeline, null, 2)
    );

    const orders = await Order.aggregate(pipeline);
    console.log("✅ Orders Fetched:", orders.length);

    sendResponse(res, 200, "Orders fetched", {
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("❌ Error in getAllOrders:", err);
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

exports.getOrderSummary = async (req, res, next) => {
  try {
    const [totalOrders, pendingOrders, paidOrders, revenueTodayAgg] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ isPaid: true }),
        Order.aggregate([
          {
            $match: {
              isPaid: true,
              paidAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

    const revenueToday = revenueTodayAgg[0]?.total || 0;

    sendResponse(res, 200, "Order summary fetched", {
      totalOrders,
      pendingOrders,
      paidOrders,
      revenueToday,
    });
  } catch (err) {
    next(err);
  }
};
