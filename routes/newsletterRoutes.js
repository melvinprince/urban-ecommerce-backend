const express = require("express");
const router = express.Router();

const {
  createSubscriber,
  getAllSubscribers,
} = require("../controllers/newsletterController");
const { newsletterRules } = require("../validators/newsletterValidationRules");
const {
  handleValidationErrors,
} = require("../middleware/validationResultHandler");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/role");

// Public: Subscribe endpoint
router.post("/", newsletterRules(), handleValidationErrors, createSubscriber);

// (Optional) Admin-only: list all subscribers
router.get("/", auth, isAdmin, getAllSubscribers);

module.exports = router;
