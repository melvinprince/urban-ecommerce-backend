const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} = require("../controllers/addressController");

router.use(auth);

router.get("/", getUserAddresses);
router.post("/", addUserAddress);
router.put("/:index", updateUserAddress);
router.delete("/:index", deleteUserAddress);

module.exports = router;
