const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} = require("../controllers/addressController");

const { addressRules } = require("../validators/addressValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");

router.use(auth);

router.get("/", getUserAddresses);

router.post(
  "/",
  addressRules(), // 🧩 validate
  handleValidationErrors, // 🧩 handle validation result
  addUserAddress // ✅ only runs if validated
);

router.put(
  "/:index",
  addressRules(),
  handleValidationErrors,
  updateUserAddress
);

router.delete("/:index", deleteUserAddress);

module.exports = router;
