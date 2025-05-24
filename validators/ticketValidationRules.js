// backend/validators/ticketValidationRules.js

const { body } = require("express-validator");

const ticketRules = () => [
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ max: 100 })
    .withMessage("Subject must be under 100 characters")
    .escape(),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters")
    .escape(),

  body("orderRef")
    .optional()
    .trim()
    .isString()
    .withMessage("Order reference must be a string")
    .escape(),
];

module.exports = {
  ticketRules,
};
