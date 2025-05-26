// controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../middleware/responseMiddleware");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors");

// Token generator
const createTokenAndSetCookie = (user, res) => {
  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "test" ? "lax" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);
};

// Register
exports.registerUser = async (req, res, next) => {
  const { name, email, password, repeatPassword } = req.body;

  try {
    if (!name || !email || !password || !repeatPassword) {
      return next(new BadRequestError("All fields are required"));
    }

    if (password !== repeatPassword) {
      return next(new BadRequestError("Passwords do not match"));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ConflictError("User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    createTokenAndSetCookie(user, res);

    sendResponse(res, 201, "User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    createTokenAndSetCookie(user, res);

    sendResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError("Not authenticated"));
    }

    sendResponse(res, 200, "User details fetched", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (err) {
    next(err);
  }
};

// Logout
exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    sendResponse(res, 200, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};
