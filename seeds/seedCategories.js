require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    // 1) Clear existing categories
    await Category.deleteMany();
    console.log("🗑️  Cleared existing categories");

    // 2) Create top-level categories
    const [men, women, kids, sneakers] = await Category.create([
      { name: "Men's Apparel", slug: "mens-apparel" },
      { name: "Women's Apparel", slug: "womens-apparel" },
      { name: "Kids (3+)", slug: "kids-apparel" },
      { name: "Sneakers", slug: "sneakers" },
    ]);
    console.log("✅ Created main categories");

    // 3) Create sub-categories for each
    const subCats = await Category.create([
      // — Men's Apparel
      { name: "Shirts", slug: "mens-shirts", parent: men._id },
      { name: "Pants", slug: "mens-pants", parent: men._id },
      { name: "Outerwear", slug: "mens-outerwear", parent: men._id },
      { name: "Accessories", slug: "mens-accessories", parent: men._id },

      // — Women's Apparel
      { name: "Dresses", slug: "womens-dresses", parent: women._id },
      { name: "Tops", slug: "womens-tops", parent: women._id },
      { name: "Skirts", slug: "womens-skirts", parent: women._id },
      { name: "Handbags", slug: "womens-handbags", parent: women._id },

      // — Kids Apparel
      { name: "Boys Apparel", slug: "kids-boys-apparel", parent: kids._id },
      { name: "Girls Apparel", slug: "kids-girls-apparel", parent: kids._id },
      { name: "Toys & Fun", slug: "kids-toys", parent: kids._id },

      // — Sneakers
      { name: "Running Shoes", slug: "sneakers-running", parent: sneakers._id },
      {
        name: "Casual Sneakers",
        slug: "sneakers-casual",
        parent: sneakers._id,
      },
      { name: "High-tops", slug: "sneakers-high-tops", parent: sneakers._id },
    ]);
    console.log("✅ Created sub-categories");

    // 4) Create a level of sub-sub-categories (for depth)
    const [shirts, pants, dresses, tops] = subCats;

    await Category.create([
      // — Mens Shirts
      { name: "Dress Shirts", slug: "mens-dress-shirts", parent: shirts._id },
      { name: "Casual Shirts", slug: "mens-casual-shirts", parent: shirts._id },

      // — Mens Pants
      { name: "Jeans", slug: "mens-jeans", parent: pants._id },
      { name: "Chinos", slug: "mens-chinos", parent: pants._id },
      { name: "Shorts", slug: "mens-shorts", parent: pants._id },

      // — Womens Dresses
      {
        name: "Evening Dresses",
        slug: "womens-evening-dresses",
        parent: dresses._id,
      },
      {
        name: "Casual Dresses",
        slug: "womens-casual-dresses",
        parent: dresses._id,
      },

      // — Womens Tops
      { name: "Blouses", slug: "womens-blouses", parent: tops._id },
      { name: "T-Shirts", slug: "womens-tshirts", parent: tops._id },
    ]);
    console.log("✅ Created sub-sub-categories");

    console.log("🎉 Seeding complete!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedCategories();
