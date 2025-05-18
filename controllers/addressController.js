const { sendResponse } = require("../middleware/responseMiddleware");

exports.getUserAddresses = async (req, res, next) => {
  try {
    const addresses = req.user.addresses || [];
    sendResponse(res, 200, "Addresses fetched", addresses);
  } catch (err) {
    next(err);
  }
};

exports.addUserAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    req.user.addresses.push(address);
    await req.user.save();
    sendResponse(res, 201, "Address added", req.user.addresses);
  } catch (err) {
    next(err);
  }
};

exports.updateUserAddress = async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);
    const { address } = req.body;

    if (index < 0 || index >= req.user.addresses.length) {
      res.status(400);
      throw new Error("Invalid address index");
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
    if (index < 0 || index >= req.user.addresses.length) {
      res.status(400);
      throw new Error("Invalid address index");
    }

    req.user.addresses.splice(index, 1);
    await req.user.save();

    sendResponse(res, 200, "Address deleted", req.user.addresses);
  } catch (err) {
    next(err);
  }
};
