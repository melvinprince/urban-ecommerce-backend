const { body } = require("express-validator");

const applyCouponRules = () => [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .toUpperCase()
    .escape(),

  body("subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be a valid number"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
];

module.exports = {
  applyCouponRules,
};
