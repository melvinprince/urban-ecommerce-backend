// middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError, NotFoundError } = require("../utils/errors");

module.exports = async function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return next(new UnauthorizedError("No token, authorization denied"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return next(new UnauthorizedError("Token is not valid"));
  }
};
