const express = require("express");
const router = express.Router();
const {
  createPaypalOrder,
  capturePaypalOrder,
} = require("../controllers/paypalController");

router.post("/create", createPaypalOrder);
router.post("/capture/:id", capturePaypalOrder);

module.exports = router;
