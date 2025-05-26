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

//admin routes
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCouponRoutes = require("./routes/adminCouponRoutes");
const adminTicketRoutes = require("./routes/adminTicketRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();

// Security & Logging Middleware
app.use(helmet());

// CORS Setup
const allowedOrigins = process.env.FRONT_END_URL
  ? process.env.FRONT_END_URL.split(",").map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Serve static uploads (for product images & tickets)
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

// Admin Routes (auth + admin required)
app.use("/api/admin/products", auth, isAdmin, adminProductRoutes);
app.use("/api/admin/categories", auth, isAdmin, adminCategoryRoutes);
app.use("/api/admin/orders", auth, isAdmin, adminOrderRoutes);
app.use("/api/admin/coupons", auth, isAdmin, adminCouponRoutes);
app.use("/api/admin/tickets", auth, isAdmin, adminTicketRoutes);
app.use("/api/admin/users", auth, isAdmin, adminUserRoutes);

// Fallback for undefined routes
app.use("*", (req, res) => res.status(404).json({ message: "Not Found" }));

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
