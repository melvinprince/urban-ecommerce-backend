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

router.post(
  "/",
  authOptional,
  orderRules(),
  handleValidationErrors,
  createOrder
);
router.get("/my-orders", auth, getMyOrders);
router.get("/:id", authOptional, getOrderById);
router.get("/by-custom/:customId", getOrderByCustomId);
router.get("/email/:email", getOrdersByEmail);
router.patch("/:customOrderId/cancel", auth, cancelOrder);
router.patch("/cancel-guest", cancelOrderAsGuest);
router.patch("/edit/:customId", authOptional, editOrder);

module.exports = router;
