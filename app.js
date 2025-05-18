const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("express-async-errors");

const auth = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoute");
const categoryRoutes = require("./routes/categoryRoute");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const addressRoutes = require("./routes/addressRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get("/", (req, res) => {
  res.send("✅ API is Running...");
});

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/paypal", paypalRoutes);

// Protected Routes
app.use("/api/cart", auth, cartRoutes);
app.use("/api/user/addresses", auth, addressRoutes); // 🆕 ADDED HERE

// Centralized Error Handler (MUST be last)
app.use(errorHandler);

module.exports = app;
