// backend/routes/adminUserRoutes.js

const express = require("express");
const adminUserController = require("../controllers/adminUserController");

const router = express.Router();

// Get all users
router.get("/", adminUserController.getAllUsers);

// Get a single user by ID
router.get("/:id", adminUserController.getUserById);

// Create a new user (admin only)
router.post("/", adminUserController.createUser);

// Update a user (role, email, name)
router.put("/:id", adminUserController.updateUser);

// Ban/unban a user
router.patch("/:id/ban", adminUserController.toggleBanStatus);

// Delete a user
router.delete("/:id", adminUserController.deleteUser);

module.exports = router;
