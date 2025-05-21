const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  searchProducts,
  getProductsByIds,
} = require("../controllers/productController");

// GET /api/products
router.get("/", getProducts);

// Product search route
router.get("/search", searchProducts);

// GET /api/products/:slug
router.get("/:slug", getProductBySlug);

// POST /api/products/by-ids
router.post("/by-ids", getProductsByIds);

module.exports = router;
