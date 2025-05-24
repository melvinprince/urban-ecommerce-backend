const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimiter");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");
const {
  registerRules,
  loginRules,
} = require("../validators/authValidationRules");
const auth = require("../middleware/auth");

const router = express.Router();

// Register route with validation
router.post(
  "/register",
  authLimiter,
  registerRules(),
  handleValidationErrors,
  registerUser
);

// Login route with validation
router.post(
  "/login",
  authLimiter,
  loginRules(),
  handleValidationErrors,
  loginUser
);

router.get("/me", auth, getMe);

router.post("/logout", logoutUser);

module.exports = router;
