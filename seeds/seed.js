require("dotenv").config();
const mongoose = require("mongoose");

const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order"); // if you have Order model

const connectDB = require("../config/db");

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

    console.log("⏳ Clearing existing data...");

    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    if (Order.collection) await Order.deleteMany();

    console.log("✅ Existing data cleared.");

    console.log("⏳ Seeding categories...");
    const [men, women, kids, sneakers] = await Category.create([
      { name: "Men's Apparel", slug: "mens-apparel" },
      { name: "Women's Apparel", slug: "womens-apparel" },
      { name: "Kids (3+)", slug: "kids-apparel" },
      { name: "Sneakers", slug: "sneakers" },
    ]);

    const subCats = await Category.create([
      // Men's Apparel
      { name: "Shirts", slug: "mens-shirts", parent: men._id },
      { name: "Pants", slug: "mens-pants", parent: men._id },
      { name: "Outerwear", slug: "mens-outerwear", parent: men._id },
      { name: "Accessories", slug: "mens-accessories", parent: men._id },
      // Women's Apparel
      { name: "Dresses", slug: "womens-dresses", parent: women._id },
      { name: "Tops", slug: "womens-tops", parent: women._id },
      { name: "Skirts", slug: "womens-skirts", parent: women._id },
      { name: "Handbags", slug: "womens-handbags", parent: women._id },
      // Kids Apparel
      { name: "Boys Apparel", slug: "kids-boys-apparel", parent: kids._id },
      { name: "Girls Apparel", slug: "kids-girls-apparel", parent: kids._id },
      { name: "Toys & Fun", slug: "kids-toys", parent: kids._id },
      // Sneakers
      { name: "Running Shoes", slug: "sneakers-running", parent: sneakers._id },
      {
        name: "Casual Sneakers",
        slug: "sneakers-casual",
        parent: sneakers._id,
      },
      { name: "High-tops", slug: "sneakers-high-tops", parent: sneakers._id },
    ]);

    const [shirts, pants, dresses, tops] = subCats;

    await Category.create([
      // Mens Shirts
      { name: "Dress Shirts", slug: "mens-dress-shirts", parent: shirts._id },
      { name: "Casual Shirts", slug: "mens-casual-shirts", parent: shirts._id },
      // Mens Pants
      { name: "Jeans", slug: "mens-jeans", parent: pants._id },
      { name: "Chinos", slug: "mens-chinos", parent: pants._id },
      { name: "Shorts", slug: "mens-shorts", parent: pants._id },
      // Womens Dresses
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
      // Womens Tops
      { name: "Blouses", slug: "womens-blouses", parent: tops._id },
      { name: "T-Shirts", slug: "womens-tshirts", parent: tops._id },
    ]);

    console.log("✅ Categories seeded.");

    console.log("⏳ Seeding products...");
    const allCategories = await Category.find();
    const categories = allCategories.filter(
      (cat) => cat.slug !== "kids-apparel"
    );

    const productsToCreate = [];

    for (const cat of categories) {
      const ancestors = await gatherAncestors(cat, allCategories);
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
