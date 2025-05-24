// routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const cartCtrl = require("../controllers/cartController");

router.get("/", auth, cartCtrl.getCart);
router.post("/", auth, cartCtrl.addOrUpdateCart);
router.delete("/clear", auth, cartCtrl.clearCart);
router.put("/:itemId", auth, cartCtrl.updateCartItem);
router.delete("/:itemId", auth, cartCtrl.removeCartItem);

module.exports = router;
