// controllers/reviewController.js

const Review = require("../models/Review");
const Order = require("../models/Order");
const { sendResponse } = require("../middleware/responseMiddleware");
const {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
} = require("../utils/errors");

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user._id;

    if (!product || !rating) {
      return next(new BadRequestError("Product and rating are required."));
    }

    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": product,
      status: { $ne: "cancelled" },
    });

    if (!hasPurchased) {
      return next(
        new ForbiddenError(
          "You need to purchase this product before leaving a review."
        )
      );
    }

    const alreadyReviewed = await Review.findOne({ user: userId, product });
    if (alreadyReviewed) {
      return next(
        new BadRequestError("You have already reviewed this product.")
      );
    }

    const review = await Review.create({
      user: userId,
      product,
      order: hasPurchased._id,
      rating,
      comment,
    });

    sendResponse(res, 201, "Review submitted successfully.", review);
  } catch (err) {
    next(err);
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    if (!productId) {
      return next(new BadRequestError("Product ID is required."));
    }

    const reviews = await Review.find({
      product: productId,
      hidden: false,
    }).populate("user", "name");

    sendResponse(res, 200, "Product reviews fetched", reviews);
  } catch (err) {
    next(err);
  }
};
