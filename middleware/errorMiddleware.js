// middleware/errorMiddleware.js

const { CustomError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    ...(err.details && { details: err.details }), // Attach extra info like validation errors
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
