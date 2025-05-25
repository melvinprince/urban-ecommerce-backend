// backend/seeds/seedCoupons.js
require("dotenv").config();
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const connectDB = require("../config/db");

const seedCoupons = async () => {
  try {
    await connectDB();

    await Coupon.deleteMany();
    console.log("✅ Existing coupons cleared.");

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const coupons = [
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        minSubtotal: 50,
        usageLimit: 100,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "SAVE20",
        type: "percentage",
        value: 20,
        minSubtotal: 100,
        usageLimit: 50,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "FLAT50",
        type: "fixed",
        value: 50,
        minSubtotal: 200,
        usageLimit: 30,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "FREESHIP",
        type: "fixed",
        value: 25,
        minSubtotal: 75,
        usageLimit: 200,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "SPRING15",
        type: "percentage",
        value: 15,
        minSubtotal: 75,
        usageLimit: 150,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "FLASH30",
        type: "percentage",
        value: 30,
        minSubtotal: 150,
        usageLimit: 20,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "LIMITED100",
        type: "fixed",
        value: 100,
        minSubtotal: 300,
        usageLimit: 10,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "BIGSALE50",
        type: "percentage",
        value: 50,
        minSubtotal: 500,
        usageLimit: 5,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "BUNDLEDEAL",
        type: "fixed",
        value: 75,
        minSubtotal: 250,
        usageLimit: 50,
        startDate: now,
        expiryDate: nextMonth,
      },
      {
        code: "REWARD15",
        type: "percentage",
        value: 15,
        minSubtotal: 100,
        usageLimit: 100,
        startDate: now,
        expiryDate: nextMonth,
      },
    ];

    await Coupon.insertMany(coupons);
    console.log("✅ 10 coupons seeded successfully.");

    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding Error: ${err.message}`);
    process.exit(1);
  }
};

seedCoupons();
