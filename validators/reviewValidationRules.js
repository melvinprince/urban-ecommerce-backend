const { body } = require("express-validator");

const reviewRules = () => [
  body("product").isMongoId().withMessage("Invalid product ID"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters")
    .escape(),
];

module.exports = {
  reviewRules,
};
