// routes/authRoute.js

const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");
const {
  registerRules,
  loginRules,
} = require("../validators/authValidationRules");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerRules(), handleValidationErrors, registerUser);
router.post("/login", loginRules(), handleValidationErrors, loginUser);
router.get("/me", auth, getMe);
router.post("/logout", logoutUser);

module.exports = router;
