// controllers/userAddressController.js

const { sendResponse } = require("../middleware/responseMiddleware");
const { BadRequestError, NotFoundError } = require("../utils/errors");

exports.getUserAddresses = async (req, res, next) => {
  try {
    const addresses = req.user?.addresses || [];
    sendResponse(res, 200, "Addresses fetched", addresses);
  } catch (err) {
    next(err);
  }
};

exports.addUserAddress = async (req, res, next) => {
  try {
    if (!req.user || !Array.isArray(req.user.addresses)) {
      console.warn("❗ User or addresses array not found");
      return next(new NotFoundError("User not found or addresses missing"));
    }

    req.user.addresses.push(req.body);
    await req.user.save();
    sendResponse(res, 201, "Address added", req.user.addresses);
  } catch (err) {
    console.error("❌ Error in addUserAddress", err);
    next(err);
  }
};

exports.updateUserAddress = async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);
    const { address } = req.body;

    if (isNaN(index) || index < 0 || index >= req.user.addresses.length) {
      return next(new BadRequestError("Invalid address index"));
    }

    req.user.addresses[index] = { ...req.user.addresses[index], ...address };
    await req.user.save();

    sendResponse(res, 200, "Address updated", req.user.addresses);
  } catch (err) {
    next(err);
  }
};

exports.deleteUserAddress = async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= req.user.addresses.length) {
      return next(new BadRequestError("Invalid address index"));
    }

    req.user.addresses.splice(index, 1);
    await req.user.save();

    sendResponse(res, 200, "Address deleted", req.user.addresses);
  } catch (err) {
    next(err);
  }
};
