// middleware/authOptional.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(); // no token, proceed without user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user; // attach user to request
    }
  } catch (err) {
    console.warn("Optional auth token invalid:", err.message);
  }

  next(); // continue regardless
};
