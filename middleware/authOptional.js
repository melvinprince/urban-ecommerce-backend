// middleware/authOptional.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/errors");

module.exports = async function authOptional(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return next(); // No token, proceed without user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.warn("Optional auth token invalid:", err.message);
    // Do not throw error here; proceed without user
  }

  next();
};
