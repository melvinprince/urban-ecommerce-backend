const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(
      "❌ Validation Error Details:",
      JSON.stringify(errors.array(), null, 2)
    );
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param || err.path,
        message: err.msg,
        value: err.value,
        location: err.location,
      })),
    });
  }

  next();
};

module.exports = { handleValidationErrors };
