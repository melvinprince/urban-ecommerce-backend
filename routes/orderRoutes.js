const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrderByCustomId,
  getOrdersByEmail,
  cancelOrder,
  cancelOrderAsGuest,
  editOrder,
} = require("../controllers/orderController");

const auth = require("../middleware/auth");
const authOptional = require("../middleware/authOptional");

const { orderRules } = require("../validators/orderValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");

// Allow guest + logged-in user checkout
router.post(
  "/",
  authOptional,
  orderRules(),
  handleValidationErrors,
  createOrder
);

// Requires login to view personal order history
router.get("/my-orders", auth, getMyOrders);

// Public route for order confirmation page
router.get("/:id", authOptional, getOrderById);

// Public route for order confirmation page with custom ID
router.get("/by-custom/:customId", getOrderByCustomId);

// Public route for order confirmation page with email
router.get("/email/:email", getOrdersByEmail);

// Requires login to cancel order
router.patch("/:customOrderId/cancel", auth, cancelOrder);

// Public route for guest cancellation
router.patch("/cancel-guest", cancelOrderAsGuest);

// Edit order
router.patch("/edit/:customId", authOptional, editOrder);

module.exports = router;
