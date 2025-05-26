// backend/routes/adminOrderRoutes.js

const express = require("express");
const adminOrderController = require("../controllers/adminOrderController");

const router = express.Router();

// Get all orders (admin view)
router.get("/", adminOrderController.getAllOrders);

// Get a single order by ID
router.get("/:id", adminOrderController.getOrderById);

// Update order status, shipping details, payment info
router.patch("/:id", adminOrderController.updateOrder);

// Mark order as paid/unpaid
router.patch("/:id/payment", adminOrderController.updatePaymentStatus);

// Cancel an order
router.patch("/:id/cancel", adminOrderController.cancelOrder);

// Delete an order (optional, for cleanup)
router.delete("/:id", adminOrderController.deleteOrder);

module.exports = router;
