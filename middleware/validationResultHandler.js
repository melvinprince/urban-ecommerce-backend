// middleware/handleValidationErrors.js

const { validationResult } = require("express-validator");
const { BadRequestError } = require("../utils/errors");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(
      "❌ Validation Error Details:",
      JSON.stringify(errors.array(), null, 2)
    );

    // Format errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.param || err.path,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    return next(new BadRequestError("Validation failed", formattedErrors));
  }

  next();
};

module.exports = { handleValidationErrors };
