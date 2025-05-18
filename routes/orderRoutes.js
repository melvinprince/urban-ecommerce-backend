const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrderByCustomId,
} = require("../controllers/orderController");

const auth = require("../middleware/auth");
const authOptional = require("../middleware/authOptional");

//Allow guest checkout
router.post("/", authOptional, createOrder);

//Requires login to view personal order history
router.get("/my-orders", auth, getMyOrders);

//Public route for order confirmation page
router.get("/:id", authOptional, getOrderById);

//Public route for order confirmation page with custom ID
router.get("/by-custom/:customId", getOrderByCustomId);

module.exports = router;
