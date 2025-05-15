// seeds/seedProducts.js
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

async function gatherAncestors(cat, allCats) {
  const ancestors = [];
  let current = cat;
  while (current.parent) {
    const parent = allCats.find(
      (c) => c._id.toString() === current.parent.toString()
    );
    if (!parent) break;
    ancestors.push(parent._id);
    current = parent;
  }
  return ancestors;
}

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    // 1) Clear existing products
    await Product.deleteMany();
    console.log("🗑️  Cleared existing products");

    // 2) Load all categories, optionally skip one
    const allCategories = await Category.find();
    // e.g. skip kids-apparel if you like:
    const categories = allCategories.filter(
      (cat) => cat.slug !== "kids-apparel"
    );
    console.log(`📂 Seeding products for ${categories.length} categories`);

    const productsToCreate = [];

    for (const cat of categories) {
      // find all ancestor IDs (parent, grandparent, …)
      const ancestors = await gatherAncestors(cat, allCategories);
      // our categories array:
      const catIds = [cat._id, ...ancestors];

      for (let i = 1; i <= 3; i++) {
        productsToCreate.push({
          title: `${cat.name} Item ${i}`,
          slug: `${cat.slug}-item-${i}`,
          description: `This is a detailed description for ${cat.name} Item ${i}. Premium quality.`,
          shortDescription: `High-quality ${cat.name.toLowerCase()} item ${i}.`,
          price: Math.floor(Math.random() * 80) + 20,
          discountPrice: null,
          sku: `SKU-${cat.slug.toUpperCase()}-${i}`,
          categories: catIds,
          sizes: ["S", "M", "L"],
          colors: ["Black", "Olive Green", "White"],
          images: [
            `https://picsum.photos/seed/${cat.slug}-${i}/200/300`,
            `https://picsum.photos/seed/${cat.slug}-${i}-2/200/300`,
          ],
          stock: Math.floor(Math.random() * 90) + 10,
          isFeatured: false,
          isActive: true,
          tags: [],
          rating: { average: 0, count: 0 },
        });
      }
    }

    // 4) Insert into DB
    await Product.create(productsToCreate);
    console.log(
      `✅ Created ${productsToCreate.length} products across ${categories.length} categories`
    );

    console.log("🎉 Product seeding complete!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedProducts();
