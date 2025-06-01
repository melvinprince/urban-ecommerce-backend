require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * Recursively gathers ancestor IDs for a given category.
 */
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

/** Utility: random integer between min and max (inclusive) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Utility: pick N random elements from array */
function pickRandomSubset(arr, count) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Main seeding function.
 */
async function seedProducts() {
  try {
    // 1) Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    // 2) Clear existing products
    await Product.deleteMany();
    console.log("🗑️  Cleared existing products");

    // 3) Load all categories
    const allCategories = await Category.find();
    if (!allCategories.length) {
      console.error("⚠️  No categories found—seed categories first.");
      process.exit(1);
    }
    console.log(`📂 Found ${allCategories.length} categories.`);

    const productsToInsert = [];

    // Predefined size/color options
    const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];
    const COLOR_OPTIONS = [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Gray",
    ];

    // Possible materials for clothing-based tags
    const MATERIALS = ["cotton", "denim", "leather", "linen", "synthetic"];
    const CLOTHING_NOUNS = [
      "Shirt",
      "Shirts",
      "T-Shirt",
      "Dress",
      "Jeans",
      "Jacket",
      "Sweater",
      "Hoodie",
      "Pants",
      "Skirt",
      "Top",
      "Blouse",
    ];

    // 4) For each category, generate 5 products
    for (const cat of allCategories) {
      const ancestorIds = await gatherAncestors(cat, allCategories);
      const categoryLineage = [cat._id, ...ancestorIds];

      for (let i = 1; i <= 5; i++) {
        // 4a) Build title & slug
        const descriptors = [
          "Classic",
          "Premium",
          "Sporty",
          "Elegant",
          "Modern",
          "Urban",
          "Vintage",
          "Comfort",
          "Stylish",
          "Trendy",
        ];
        const noun = cat.name.split(" ").slice(-1)[0];
        const descriptor = descriptors[randInt(0, descriptors.length - 1)];
        const title = `${descriptor} ${noun} ${i}`;
        const slug = `${cat.slug}-product-${i}`;

        // 4b) Price & optional discount (integers only)
        const price = randInt(20, 200);
        let discountPrice = null;
        const applyDiscount = Math.random() < 0.4;
        if (applyDiscount) {
          const discountPct = randInt(10, 30);
          discountPrice = Math.round(price * (1 - discountPct / 100));
        }

        // 4c) Sizes & colors
        const sizes = pickRandomSubset(
          SIZE_OPTIONS,
          randInt(2, Math.min(4, SIZE_OPTIONS.length))
        );
        const colors = pickRandomSubset(
          COLOR_OPTIONS,
          randInt(2, Math.min(4, COLOR_OPTIONS.length))
        );

        // 4d) Generate 2–5 image URLs via Picsum
        const imgCount = randInt(2, 5);
        const images = [];
        for (let j = 1; j <= imgCount; j++) {
          images.push(
            `https://picsum.photos/seed/${cat.slug}-${i}-${j}/200/300`
          );
        }

        // 4e) Stock level
        const stock = randInt(0, 100);

        // 4f) Featured flag
        const isFeatured = i === 1;

        // 4g) Always active
        const isActive = true;

        // 4h) Build realistic tags
        const rawTags = new Set();
        rawTags.add(cat.slug.toLowerCase()); // category slug
        rawTags.add(noun.toLowerCase()); // noun itself
        rawTags.add(`${descriptor.toLowerCase()} ${noun.toLowerCase()}`); // descriptor + noun

        // If category name mentions "Men" or "Women", add those variants
        const lowerCatName = cat.name.toLowerCase();
        if (lowerCatName.includes("men")) {
          rawTags.add(`mens ${noun.toLowerCase()}`);
        }
        if (lowerCatName.includes("women")) {
          rawTags.add(`womens ${noun.toLowerCase()}`);
        }

        // Add a color-based tag, e.g., "red shirt"
        const colorTag = `${colors[0].toLowerCase()} ${noun.toLowerCase()}`;
        rawTags.add(colorTag);

        // If noun is a common clothing term, add a material-based tag
        if (
          CLOTHING_NOUNS.some((cn) => cn.toLowerCase() === noun.toLowerCase())
        ) {
          const material = MATERIALS[randInt(0, MATERIALS.length - 1)];
          rawTags.add(`${noun.toLowerCase()} ${material}`);
        }

        // Sale / featured / generic tags
        if (isFeatured) rawTags.add("featured");
        if (applyDiscount) rawTags.add("sale");
        rawTags.add("new-arrival");
        rawTags.add("bestseller");

        // Finally, convert to array
        const tags = Array.from(rawTags);

        // 4i) Descriptions
        const shortDescription = `${descriptor} ${noun} crafted for style and comfort. Perfect for everyday wear.`;
        const description = `${shortDescription} This ${noun.toLowerCase()} from our ${
          cat.name
        } collection features premium materials, exceptional durability, and a modern design that suits any occasion. Available in multiple sizes and colors.${
          applyDiscount ? " Currently on sale at a special discount!" : ""
        }`;

        // 4j) SEO metadata
        const seoTitle = title;
        const seoDescription = shortDescription;
        const seoKeywords = [
          ...title.toLowerCase().split(" ").filter(Boolean),
          cat.slug.toLowerCase(),
        ];

        // 4k) Generate a unique SKU (6-digit random hex snippet ensures no duplicates)
        const randomHex = Math.random().toString(16).slice(-6).toUpperCase();
        const sku = `${cat.slug.toUpperCase().slice(0, 3)}-${i}-${randomHex}`;

        // 4l) Assemble final product object
        const productObj = {
          title,
          slug,
          description,
          shortDescription,
          price,
          discountPrice,
          sku,
          categories: categoryLineage,
          sizes,
          colors,
          images,
          stock,
          isFeatured,
          isActive,
          tags,
          rating: { average: 0, count: 0 },
          seoTitle,
          seoDescription,
          seoKeywords,
        };

        productsToInsert.push(productObj);
      }
    }

    // 5) Bulk insert
    await Product.insertMany(productsToInsert);
    console.log(
      `✅ Seeded ${productsToInsert.length} products across ${allCategories.length} categories (5 each).`
    );

    await mongoose.connection.close();
    console.log("🔌 Connection closed—seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during product seeding:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedProducts();
