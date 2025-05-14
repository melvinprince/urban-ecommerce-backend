const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("express-async-errors");
const authRoutes = require("./routes/auth");

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

// Error Handler (Basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
