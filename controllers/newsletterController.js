const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, InternalServerError } = require("../utils/errors");

// Create a new newsletter subscription
exports.createSubscriber = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new BadRequestError("Email is required."));
    }

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return next(new BadRequestError("This email is already subscribed."));
    }

    // Create new subscriber
    const subscriber = await NewsletterSubscriber.create({ email });
    sendResponse(res, 201, "Subscription successful.", subscriber);
  } catch (err) {
    // If it's a duplicate-key error at the database layer
    if (err.code === 11000) {
      return next(new BadRequestError("This email is already subscribed."));
    }
    next(new InternalServerError("Failed to subscribe. Please try again."));
  }
};

// (Optional) Fetch all subscribers – you can expose this to admin if needed
exports.getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({
      createdAt: -1,
    });
    sendResponse(res, 200, "Subscribers fetched successfully.", subscribers);
  } catch (err) {
    next(new InternalServerError("Could not fetch subscribers."));
  }
};
