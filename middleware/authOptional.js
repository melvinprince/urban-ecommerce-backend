const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authOptional(req, res, next) {
  const token = req.cookies.token;

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
