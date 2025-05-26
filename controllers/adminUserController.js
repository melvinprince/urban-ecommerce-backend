// backend/controllers/adminUserController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendResponse } = require("../middleware/responseMiddleware");
const { NotFoundError, BadRequestError } = require("../utils/errors");

// @desc Get all users
// @route GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    sendResponse(res, 200, "All users fetched", users);
  } catch (err) {
    next(err);
  }
};

// @desc Get a single user by ID
// @route GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(new NotFoundError("User not found"));
    sendResponse(res, 200, "User fetched", user);
  } catch (err) {
    next(err);
  }
};

// @desc Create a new user (admin or regular)
// @route POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(
        new BadRequestError("Name, email, and password are required")
      );
    }

    if (role && !["adm", "usr"].includes(role)) {
      return next(new BadRequestError("Invalid role"));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new BadRequestError("User with this email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "usr",
    });

    sendResponse(res, 201, "User created", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update a user (name, email, role)
// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new NotFoundError("User not found"));

    const { name, email, role } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      if (!["adm", "usr"].includes(role)) {
        return next(new BadRequestError("Invalid role"));
      }
      user.role = role;
    }

    await user.save();

    sendResponse(res, 200, "User updated", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Ban or unban a user (toggle)
// @route PATCH /api/admin/users/:id/ban
exports.toggleBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new NotFoundError("User not found"));

    // Ban logic: flip role between 'usr' and 'banned'
    if (user.role === "banned") {
      user.role = "usr";
    } else if (user.role === "usr") {
      user.role = "banned";
    } else {
      return next(new BadRequestError("Cannot ban/unban an admin directly"));
    }

    await user.save();
    sendResponse(
      res,
      200,
      `User ${user.role === "banned" ? "banned" : "unbanned"}`,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    );
  } catch (err) {
    next(err);
  }
};

// @desc Delete a user
// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new NotFoundError("User not found"));
    sendResponse(res, 200, "User deleted");
  } catch (err) {
    next(err);
  }
};
