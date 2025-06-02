const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const wishlistCtrl = require("../controllers/wishlistController");

router.get("/", auth, wishlistCtrl.getWishlist);
router.post("/", auth, wishlistCtrl.addToWishlist);
router.delete("/:itemId", auth, wishlistCtrl.removeFromWishlist);
router.post("/clear", auth, wishlistCtrl.clearWishlist);

module.exports = router;
