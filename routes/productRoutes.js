const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  searchProducts,
} = require("../controllers/productController");

// GET /api/products
router.get("/", getProducts);

// Product search route
router.get("/search", searchProducts);

// GET /api/products/:slug
router.get("/:slug", getProductBySlug);

module.exports = router;
