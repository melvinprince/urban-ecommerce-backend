const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Unique at DB level
      lowercase: true, // Normalize email
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["adm", "usr"],
      default: "usr",
    },
    addresses: [
      {
        label: { type: String, default: "My Address" }, // e.g. Home, Office
        fullName: String,
        email: String,
        phone: String,
        street: String,
        city: String,
        postalCode: String,
        country: String,
        isDefault: { type: Boolean, default: false },
        _id: false, // To avoid nested _id in each address object (optional)
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
