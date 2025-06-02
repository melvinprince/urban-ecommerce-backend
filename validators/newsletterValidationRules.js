const { check } = require("express-validator");

exports.newsletterRules = () => {
  return [
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
  ];
};
