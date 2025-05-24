const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimiter");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");
const {
  registerRules,
  loginRules,
} = require("../validators/authValidationRules");

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

module.exports = router;
