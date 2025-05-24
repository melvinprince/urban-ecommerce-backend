// backend/validators/orderValidationRules.js

const { body } = require("express-validator");

const orderRules = () => [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.product").isMongoId().withMessage("Invalid product ID"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),

  body("items.*.size").optional().isString().trim().escape(),

  body("items.*.color").optional().isString().trim().escape(),

  body("address.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .escape(),

  body("address.email").isEmail().withMessage("Invalid email").normalizeEmail(),

  body("address.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number")
    .escape(),

  body("address.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .escape(),

  body("paymentMethod")
    .optional()
    .isIn(["paypal", "cod"])
    .withMessage("Invalid payment method"),

  body("couponCode").optional().isString().trim().escape(),
];

module.exports = {
  orderRules,
};
