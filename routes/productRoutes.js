const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  searchProducts,
  getProductsByIds,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:slug", getProductBySlug);
router.post("/by-ids", getProductsByIds);

module.exports = router;
