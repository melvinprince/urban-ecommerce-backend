const { body } = require("express-validator");

const registerRules = () => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("repeatPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const loginRules = () => [
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerRules,
  loginRules,
};
