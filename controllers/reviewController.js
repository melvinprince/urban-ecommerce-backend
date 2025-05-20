const Review = require("../models/Review");
const Order = require("../models/Order");
const { sendResponse } = require("../middleware/responseMiddleware");

exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user._id;
    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": product,
      status: { $ne: "cancelled" },
    });

    if (!hasPurchased) {
      return sendResponse(
        res,
        403,
        "You need to purchase this product before leaving a review."
      );
    }

    const alreadyReviewed = await Review.findOne({ user: userId, product });
    if (alreadyReviewed) {
      return sendResponse(res, 400, "You have already reviewed this product.");
    }

    const review = await Review.create({
      user: userId,
      product,
      order: hasPurchased._id,
      rating,
      comment,
    });
    return sendResponse(res, 201, "Review submitted successfully.", review);
  } catch (err) {
    return sendResponse(res, 500, "Server error", err.message);
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({
      product: productId,
      hidden: false,
    }).populate("user", "name");
    return sendResponse(res, 200, "Product reviews fetched", reviews);
  } catch (err) {
    return sendResponse(res, 500, "Server error", err.message);
  }
};
