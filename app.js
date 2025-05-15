const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("express-async-errors");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/authRoute");
const categoryRoute = require("./routes/categoryRoute");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes Placeholder
app.get("/", (req, res) => {
  res.send("✅ API is Running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);

//Protected Routes
app.use("/api/cart", auth, cartRoutes);

// Error Handler (Basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
