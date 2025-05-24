const { client } = require("../config/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

exports.createPaypalOrder = async (req, res, next) => {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(req.body.totalAmount).toFixed(2), // ✅ FIXED
          },
        },
      ],
    });

    const response = await client().execute(request);
    res.status(201).json({ success: true, data: response.result });
  } catch (error) {
    next(error);
  }
};

exports.capturePaypalOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client().execute(request);
    res.status(200).json({ success: true, data: response.result });
  } catch (error) {
    next(error);
  }
};
