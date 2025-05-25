// backend/seed/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker"); // For realistic names

const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order");
const connectDB = require("../config/db");

const randomSizes = [
  ["S", "M", "L"],
  ["M", "L", "XL"],
  ["One Size"],
  ["XS", "M", "L", "XL"],
  ["M", "XL"],
];

const randomColors = [
  ["Black", "White"],
  ["Blue", "Red", "Green"],
  ["Beige", "Brown"],
  ["Pink", "Lavender"],
  ["Olive Green", "Navy"],
  ["Yellow", "Purple", "Grey"],
];

const randomTags = [
  "new",
  "bestseller",
  "limited",
  "exclusive",
  "eco-friendly",
];

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDiscount(price) {
  return Math.random() < 0.4
    ? Math.floor(price * (0.7 + Math.random() * 0.2))
    : null;
}

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

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany(),
      Order.deleteMany().catch(() => {}),
    ]);
    console.log("✅ Existing data cleared.");

    console.log("⏳ Seeding categories...");
    // Main Categories
    const [men, women, kids, sneakers, accessories] = await Category.create([
      { name: "Men's Apparel", slug: `mens-${Date.now()}` },
      { name: "Women's Apparel", slug: `womens-${Date.now()}` },
      { name: "Kids Apparel", slug: `kids-${Date.now()}` },
      { name: "Sneakers", slug: `sneakers-${Date.now()}` },
      { name: "Accessories", slug: `accessories-${Date.now()}` },
    ]);

    const subCats = await Category.create([
      { name: "Shirts", slug: `shirts-${Date.now()}`, parent: men._id },
      { name: "Pants", slug: `pants-${Date.now()}`, parent: men._id },
      { name: "Outerwear", slug: `outerwear-${Date.now()}`, parent: men._id },
      { name: "Dresses", slug: `dresses-${Date.now()}`, parent: women._id },
      { name: "Tops", slug: `tops-${Date.now()}`, parent: women._id },
      { name: "Skirts", slug: `skirts-${Date.now()}`, parent: women._id },
      { name: "Boys", slug: `boys-${Date.now()}`, parent: kids._id },
      { name: "Girls", slug: `girls-${Date.now()}`, parent: kids._id },
      {
        name: "Running Shoes",
        slug: `running-${Date.now()}`,
        parent: sneakers._id,
      },
      {
        name: "Casual Sneakers",
        slug: `casual-${Date.now()}`,
        parent: sneakers._id,
      },
      { name: "Bags", slug: `bags-${Date.now()}`, parent: accessories._id },
      { name: "Hats", slug: `hats-${Date.now()}`, parent: accessories._id },
      {
        name: "Jewelry",
        slug: `jewelry-${Date.now()}`,
        parent: accessories._id,
      },
    ]);

    const deeperSubCats = await Category.create([
      {
        name: "Casual Shirts",
        slug: `casualshirts-${Date.now()}`,
        parent: subCats[0]._id,
      },
      {
        name: "Dress Pants",
        slug: `dresspants-${Date.now()}`,
        parent: subCats[1]._id,
      },
      {
        name: "Winter Jackets",
        slug: `winterjackets-${Date.now()}`,
        parent: subCats[2]._id,
      },
      {
        name: "Summer Dresses",
        slug: `summerdresses-${Date.now()}`,
        parent: subCats[3]._id,
      },
      {
        name: "T-Shirts",
        slug: `tshirts-${Date.now()}`,
        parent: subCats[4]._id,
      },
      {
        name: "Pleated Skirts",
        slug: `pleatedskirts-${Date.now()}`,
        parent: subCats[5]._id,
      },
      {
        name: "Boys Tees",
        slug: `boystees-${Date.now()}`,
        parent: subCats[6]._id,
      },
      {
        name: "Girls Dresses",
        slug: `girlsdresses-${Date.now()}`,
        parent: subCats[7]._id,
      },
    ]);

    console.log("✅ Categories seeded.");

    console.log("⏳ Seeding products...");
    const allCategories = await Category.find();
    const productsToCreate = [];

    for (const cat of allCategories) {
      const ancestors = await gatherAncestors(cat, allCategories);
      const catIds = [cat._id, ...ancestors];

      for (let i = 1; i <= 5; i++) {
        const price = Math.floor(Math.random() * 100) + 20;
        const discount = getRandomDiscount(price);

        productsToCreate.push({
          title: `${cat.name} Item ${i}`,
          slug: `${cat.slug}-item-${i}-${Date.now()}`,
          description: faker.commerce.productDescription(),
          shortDescription: faker.commerce.productAdjective(),
          price,
          discountPrice: discount,
          sku: `SKU-${cat.slug.toUpperCase()}-${i}-${Date.now()}`,
          categories: catIds,
          sizes: getRandom(randomSizes),
          colors: getRandom(randomColors),
          images: [
            `https://picsum.photos/seed/${cat.slug}-${i}/400/600`,
            `https://picsum.photos/seed/${cat.slug}-${i}-2/400/600`,
          ],
          stock: Math.floor(Math.random() * 100) + 1,
          isFeatured: Math.random() < 0.2,
          isActive: true,
          tags: [getRandom(randomTags)],
          rating: { average: 0, count: 0 },
        });
      }
    }

    await Product.insertMany(productsToCreate);
    console.log(`✅ Created ${productsToCreate.length} products.`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding Error: ${err.message}`);
    process.exit(1);
  }
};

seed();
