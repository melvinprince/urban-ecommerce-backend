const express = require("express");
const router = express.Router();
const { createOrder, getOrderById } = require("../controllers/orderController");

router.post("/", createOrder); // Attach user if logged in
router.get("/:id", getOrderById); // For confirmation page

module.exports = router;
