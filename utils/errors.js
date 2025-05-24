// utils/errors.js

class CustomError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // Allow extra info like validation errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends CustomError {
  constructor(message = "Bad Request", details = null) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized", details = null) {
    super(message, 401, details);
  }
}

class ForbiddenError extends CustomError {
  constructor(message = "Forbidden", details = null) {
    super(message, 403, details);
  }
}

class NotFoundError extends CustomError {
  constructor(message = "Not Found", details = null) {
    super(message, 404, details);
  }
}

class ConflictError extends CustomError {
  constructor(message = "Conflict", details = null) {
    super(message, 409, details);
  }
}

class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error", details = null) {
    super(message, 500, details);
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
