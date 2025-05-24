// controllers/paypalController.js

const { client } = require("../config/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError } = require("../utils/errors");

exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return next(new BadRequestError("Total amount is required"));
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(totalAmount).toFixed(2),
          },
        },
      ],
    });

    const response = await client().execute(request);
    sendResponse(
      res,
      201,
      "PayPal order created successfully",
      response.result
    );
  } catch (error) {
    next(error);
  }
};

exports.capturePaypalOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return next(new BadRequestError("Order ID is required"));
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client().execute(request);
    sendResponse(
      res,
      200,
      "PayPal order captured successfully",
      response.result
    );
  } catch (error) {
    next(error);
  }
};
