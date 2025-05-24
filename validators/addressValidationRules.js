const { body } = require("express-validator");

const addressRules = () => [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must be under 100 characters")
    .escape(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .isMobilePhone("any")
    .withMessage("Invalid phone number")
    .escape(),

  body("street").trim().notEmpty().withMessage("Address is required").escape(),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean")
    .toBoolean(),
];

module.exports = {
  addressRules,
};
