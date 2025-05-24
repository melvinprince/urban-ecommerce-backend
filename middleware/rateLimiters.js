// middleware/rateLimiters.js

const rateLimit = require("express-rate-limit");

// ✅ Auth limiter (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Order limiter (create, cancel, edit)
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: {
    message: "Too many order requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ PayPal limiter (create/capture)
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    message: "Too many payment attempts. Please try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Review limiter
const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: "Too many review submissions. Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Ticket limiter (create/reply)
const ticketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: "Too many support messages. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  orderLimiter,
  paymentLimiter,
  reviewLimiter,
  ticketLimiter,
};
