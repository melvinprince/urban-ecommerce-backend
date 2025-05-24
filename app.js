// app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("express-async-errors");

// Middleware
const auth = require("./middleware/auth");
const isAdmin = require("./middleware/role");
const { errorHandler } = require("./middleware/errorMiddleware");
const {
  authLimiter,
  orderLimiter,
  paymentLimiter,
  reviewLimiter,
  ticketLimiter,
} = require("./middleware/rateLimiters");

// Routes
const authRoutes = require("./routes/authRoute");
const categoryRoutes = require("./routes/categoryRoute");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const addressRoutes = require("./routes/addressRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();

// Security & Logging Middleware
app.use(helmet());
console.log("✅ FRONT_END_URL loaded:", process.env.FRONT_END_URL);

app.use(
  cors({
    origin: process.env.FRONT_END_URL, // Allow requests from the client
    credentials: true, // 🔥 allow cookies
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Serve static uploads (for ticket file access)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check
app.get("/", (req, res) => {
  res.send("✅ API is Running...");
});

// Public Routes (with selective rate limiting)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderLimiter, orderRoutes);
app.use("/api/paypal", paymentLimiter, paypalRoutes);
app.use("/api/tickets", ticketLimiter, ticketRoutes);
app.use("/api/reviews", reviewLimiter, reviewRoutes);
app.use("/api/coupons", couponRoutes);

// Protected Routes (auth required)
app.use("/api/cart", auth, cartRoutes);
app.use("/api/user/addresses", auth, addressRoutes);

// Admin Route Prefix (auth + admin required)
app.use("/api/admin", auth, isAdmin, (req, res) => {
  res.send("✅ Admin Access Granted!");
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
