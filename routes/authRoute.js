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

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (rate limited via app.js)
router.post("/register", registerRules(), handleValidationErrors, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public (rate limited via app.js)
router.post("/login", loginRules(), handleValidationErrors, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post("/logout", logoutUser);

module.exports = router;
