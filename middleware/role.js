// middleware/isAdmin.js

const { ForbiddenError } = require("../utils/errors");

module.exports = function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "adm") {
    return next(new ForbiddenError("Access denied. Admins only."));
  }
  next();
};
