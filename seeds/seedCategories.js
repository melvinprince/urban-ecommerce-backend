require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const categoriesData = [
  // MEN
  {
    name: "Men",
    slug: "men",
    description:
      "Explore urban clothing for men: streetwear, essentials, and formal wear.",
    metaTitle: "Men's Urban Fashion",
    metaDescription:
      "Shop men's urban fashion: t-shirts, shirts, cargo pants, jackets, and more.",
    children: [
      {
        name: "Tops",
        slug: "men-tops",
        description:
          "Men's tops collection: t-shirts, polos, shirts, hoodies, and jackets.",
        metaTitle: "Men's Tops",
        metaDescription:
          "Shop urban men's tops including t-shirts, shirts, polos, and jackets.",
        children: [
          {
            name: "T-Shirts",
            slug: "men-tshirts",
            description: "Urban t-shirts for men.",
            metaTitle: "Men's T-Shirts",
            metaDescription: "Shop trendy men's t-shirts for everyday style.",
          },
          {
            name: "Shirts",
            slug: "men-shirts",
            description: "Urban shirts for men.",
            metaTitle: "Men's Shirts",
            metaDescription: "Formal and casual shirts for men.",
          },
          {
            name: "Polos",
            slug: "men-polos",
            description: "Urban polos for men.",
            metaTitle: "Men's Polos",
            metaDescription: "Classic polos for a versatile style.",
          },
          {
            name: "Sweatshirts & Hoodies",
            slug: "men-sweatshirts-hoodies",
            description: "Urban sweatshirts and hoodies for men.",
            metaTitle: "Men's Sweatshirts & Hoodies",
            metaDescription:
              "Stay comfortable with urban sweatshirts and hoodies for men.",
          },
          {
            name: "Jackets & Coats",
            slug: "men-jackets-coats",
            description: "Urban jackets and coats for men.",
            metaTitle: "Men's Jackets & Coats",
            metaDescription: "Shop men's jackets, coats, and outerwear.",
          },
        ],
      },
      {
        name: "Bottoms",
        slug: "men-bottoms",
        description:
          "Urban bottoms for men: cargo pants, joggers, jeans, and more.",
        metaTitle: "Men's Bottoms",
        metaDescription:
          "Find men's jeans, joggers, shorts, and chinos for urban style.",
        children: [
          {
            name: "Jeans",
            slug: "men-jeans",
            description: "Urban jeans for men.",
            metaTitle: "Men's Jeans",
            metaDescription: "Denim jeans for men in various fits.",
          },
          {
            name: "Cargo Pants",
            slug: "men-cargo-pants",
            description: "Urban cargo pants for men.",
            metaTitle: "Men's Cargo Pants",
            metaDescription: "Functional and stylish cargo pants for men.",
          },
          {
            name: "Joggers",
            slug: "men-joggers",
            description: "Urban joggers for men.",
            metaTitle: "Men's Joggers",
            metaDescription: "Casual joggers for comfort and style.",
          },
          {
            name: "Shorts",
            slug: "men-shorts",
            description: "Urban shorts for men.",
            metaTitle: "Men's Shorts",
            metaDescription: "Stay cool with urban shorts for men.",
          },
          {
            name: "Chinos",
            slug: "men-chinos",
            description: "Urban chinos for men.",
            metaTitle: "Men's Chinos",
            metaDescription: "Versatile chinos for a smart-casual look.",
          },
        ],
      },
      {
        name: "Suits & Ethnic",
        slug: "men-suits-ethnic",
        description: "Suits, blazers, kurtas, and ethnic wear for men.",
        metaTitle: "Men's Suits & Ethnic Wear",
        metaDescription:
          "Explore men's formal suits, blazers, kurtas, and sherwanis.",
        children: [
          {
            name: "Suits & Blazers",
            slug: "men-suits-blazers",
            description: "Men's suits and blazers.",
            metaTitle: "Men's Suits & Blazers",
            metaDescription: "Shop men's suits and blazers for formal events.",
          },
          {
            name: "Kurtas & Sherwanis",
            slug: "men-kurtas-sherwanis",
            description: "Men's kurtas and sherwanis.",
            metaTitle: "Men's Kurtas & Sherwanis",
            metaDescription:
              "Traditional wear for men: kurtas, sherwanis, and more.",
          },
        ],
      },
      {
        name: "Activewear & Loungewear",
        slug: "men-active-lounge",
        description:
          "Men's activewear and loungewear: tracksuits, tees, and more.",
        metaTitle: "Men's Activewear & Loungewear",
        metaDescription:
          "Shop men's tracksuits, performance tees, and loungewear sets.",
        children: [
          {
            name: "Tracksuits",
            slug: "men-tracksuits",
            description: "Men's tracksuits.",
            metaTitle: "Men's Tracksuits",
            metaDescription:
              "Urban tracksuits for men: comfort and style combined.",
          },
          {
            name: "Performance Tees",
            slug: "men-performance-tees",
            description: "Men's performance t-shirts.",
            metaTitle: "Men's Performance Tees",
            metaDescription: "Stay active in breathable performance t-shirts.",
          },
          {
            name: "Loungewear & Sleepwear",
            slug: "men-loungewear-sleepwear",
            description: "Men's loungewear and sleepwear.",
            metaTitle: "Men's Loungewear & Sleepwear",
            metaDescription: "Relax in men's loungewear and sleepwear.",
          },
        ],
      },
    ],
  },

  // WOMEN
  {
    name: "Women",
    slug: "women",
    description:
      "Explore women's urban clothing: tops, dresses, bottoms, and more.",
    metaTitle: "Women's Urban Fashion",
    metaDescription:
      "Shop trendy women's urban fashion: tops, dresses, and activewear.",
    children: [
      {
        name: "Tops",
        slug: "women-tops",
        description: "Women's tops: t-shirts, crop tops, blouses, and jackets.",
        metaTitle: "Women's Tops",
        metaDescription:
          "Shop women's tops: t-shirts, blouses, crop tops, and hoodies.",
        children: [
          {
            name: "T-Shirts",
            slug: "women-tshirts",
            description: "Women's t-shirts.",
            metaTitle: "Women's T-Shirts",
            metaDescription: "Explore women's t-shirts for everyday style.",
          },
          {
            name: "Blouses & Shirts",
            slug: "women-blouses-shirts",
            description: "Women's blouses and shirts.",
            metaTitle: "Women's Blouses & Shirts",
            metaDescription: "Elegant blouses and shirts for women.",
          },
          {
            name: "Crop Tops",
            slug: "women-crop-tops",
            description: "Women's crop tops.",
            metaTitle: "Women's Crop Tops",
            metaDescription: "Trendy crop tops for a bold look.",
          },
          {
            name: "Sweatshirts & Hoodies",
            slug: "women-sweatshirts-hoodies",
            description: "Women's sweatshirts and hoodies.",
            metaTitle: "Women's Sweatshirts & Hoodies",
            metaDescription: "Stay cozy with women's sweatshirts and hoodies.",
          },
          {
            name: "Jackets & Coats",
            slug: "women-jackets-coats",
            description: "Women's jackets and coats.",
            metaTitle: "Women's Jackets & Coats",
            metaDescription: "Stylish jackets and coats for women.",
          },
        ],
      },
      {
        name: "Bottoms",
        slug: "women-bottoms",
        description:
          "Urban bottoms for women: jeans, leggings, trousers, and more.",
        metaTitle: "Women's Bottoms",
        metaDescription:
          "Shop urban women's jeans, leggings, shorts, and trousers.",
        children: [
          {
            name: "Jeans",
            slug: "women-jeans",
            description: "Women's jeans.",
            metaTitle: "Women's Jeans",
            metaDescription: "Trendy women's jeans in various fits.",
          },
          {
            name: "Cargo Pants",
            slug: "women-cargo-pants",
            description: "Women's cargo pants.",
            metaTitle: "Women's Cargo Pants",
            metaDescription: "Functional cargo pants for women.",
          },
          {
            name: "Leggings",
            slug: "women-leggings",
            description: "Women's leggings.",
            metaTitle: "Women's Leggings",
            metaDescription: "Comfortable leggings for women.",
          },
          {
            name: "Skirts & Shorts",
            slug: "women-skirts-shorts",
            description: "Women's skirts and shorts.",
            metaTitle: "Women's Skirts & Shorts",
            metaDescription: "Shop skirts and shorts for women.",
          },
          {
            name: "Trousers",
            slug: "women-trousers",
            description: "Women's trousers.",
            metaTitle: "Women's Trousers",
            metaDescription: "Smart trousers for women.",
          },
        ],
      },
      {
        name: "Dresses & Ethnic",
        slug: "women-dresses-ethnic",
        description: "Women's dresses, ethnic wear, kurtas, sarees, and more.",
        metaTitle: "Women's Dresses & Ethnic Wear",
        metaDescription: "Shop women's dresses, kurtas, and ethnic wear.",
        children: [
          {
            name: "Casual Dresses",
            slug: "women-casual-dresses",
            description: "Casual dresses for women.",
            metaTitle: "Women's Casual Dresses",
            metaDescription: "Effortless casual dresses for women.",
          },
          {
            name: "Party Dresses",
            slug: "women-party-dresses",
            description: "Party dresses for women.",
            metaTitle: "Women's Party Dresses",
            metaDescription: "Glamorous party dresses for women.",
          },
          {
            name: "Maxi Dresses",
            slug: "women-maxi-dresses",
            description: "Maxi dresses for women.",
            metaTitle: "Women's Maxi Dresses",
            metaDescription: "Flowy maxi dresses for women.",
          },
          {
            name: "Kurtas & Ethnic Sets",
            slug: "women-kurtas-ethnic-sets",
            description: "Women's kurtas and ethnic sets.",
            metaTitle: "Women's Kurtas & Ethnic Sets",
            metaDescription: "Traditional kurtas and sets for women.",
          },
          {
            name: "Sarees & Lehengas",
            slug: "women-sarees-lehengas",
            description: "Sarees and lehengas for women.",
            metaTitle: "Women's Sarees & Lehengas",
            metaDescription: "Elegant sarees and lehengas for women.",
          },
        ],
      },
      {
        name: "Activewear & Loungewear",
        slug: "women-active-lounge",
        description:
          "Women's activewear: sports bras, yoga pants, and loungewear.",
        metaTitle: "Women's Activewear & Loungewear",
        metaDescription:
          "Stay active and comfortable with women's activewear and loungewear.",
        children: [
          {
            name: "Sports Bras & Tops",
            slug: "women-sports-bras",
            description: "Sports bras and tops for women.",
            metaTitle: "Women's Sports Bras",
            metaDescription:
              "Supportive sports bras and active tops for women.",
          },
          {
            name: "Yoga Pants & Leggings",
            slug: "women-yoga-pants-leggings",
            description: "Yoga pants and leggings for women.",
            metaTitle: "Women's Yoga Pants & Leggings",
            metaDescription: "Comfortable yoga pants and leggings for women.",
          },
          {
            name: "Loungewear & Sleepwear",
            slug: "women-loungewear-sleepwear",
            description: "Loungewear and sleepwear for women.",
            metaTitle: "Women's Loungewear & Sleepwear",
            metaDescription: "Relax in style with loungewear and sleepwear.",
          },
        ],
      },
    ],
  },

  // KIDS
  {
    name: "Kids",
    slug: "kids",
    description:
      "Urban kids' clothing: stylish, fun, and comfortable for all ages.",
    metaTitle: "Urban Kids Clothing",
    metaDescription:
      "Shop trendy boys' and girls' clothing: t-shirts, dresses, jeans, and more.",
    children: [
      {
        name: "Boys",
        slug: "kids-boys",
        description:
          "Trendy boys' urban wear: shirts, jeans, jackets, and ethnic wear.",
        metaTitle: "Boys' Clothing",
        metaDescription:
          "Shop t-shirts, jeans, jackets, and ethnic wear for boys.",
        children: [
          {
            name: "T-Shirts & Polos",
            slug: "boys-tshirts-polos",
            description: "T-shirts and polos for boys.",
            metaTitle: "Boys' T-Shirts & Polos",
            metaDescription: "Casual t-shirts and polos for boys.",
          },
          {
            name: "Shirts",
            slug: "boys-shirts",
            description: "Shirts for boys.",
            metaTitle: "Boys' Shirts",
            metaDescription: "Dress and casual shirts for boys.",
          },
          {
            name: "Jeans & Trousers",
            slug: "boys-jeans-trousers",
            description: "Jeans and trousers for boys.",
            metaTitle: "Boys' Jeans & Trousers",
            metaDescription: "Denim jeans and trousers for boys.",
          },
          {
            name: "Shorts",
            slug: "boys-shorts",
            description: "Shorts for boys.",
            metaTitle: "Boys' Shorts",
            metaDescription: "Comfortable shorts for boys.",
          },
          {
            name: "Sweatshirts & Hoodies",
            slug: "boys-sweatshirts-hoodies",
            description: "Sweatshirts and hoodies for boys.",
            metaTitle: "Boys' Sweatshirts & Hoodies",
            metaDescription: "Stay cozy with boys' sweatshirts and hoodies.",
          },
          {
            name: "Jackets",
            slug: "boys-jackets",
            description: "Jackets for boys.",
            metaTitle: "Boys' Jackets",
            metaDescription: "Outerwear jackets for boys.",
          },
          {
            name: "Ethnic Wear",
            slug: "boys-ethnic",
            description: "Ethnic wear for boys.",
            metaTitle: "Boys' Ethnic Wear",
            metaDescription: "Traditional kurtas and sets for boys.",
          },
        ],
      },
      {
        name: "Girls",
        slug: "kids-girls",
        description:
          "Girls' urban clothing: dresses, tops, leggings, and ethnic sets.",
        metaTitle: "Girls' Clothing",
        metaDescription:
          "Shop dresses, tops, leggings, and ethnic wear for girls.",
        children: [
          {
            name: "Tops & Tees",
            slug: "girls-tops-tees",
            description: "Tops and tees for girls.",
            metaTitle: "Girls' Tops & Tees",
            metaDescription: "Casual tops and tees for girls.",
          },
          {
            name: "Dresses & Frocks",
            slug: "girls-dresses-frocks",
            description: "Dresses and frocks for girls.",
            metaTitle: "Girls' Dresses & Frocks",
            metaDescription: "Shop dresses and frocks for girls.",
          },
          {
            name: "Jeans & Leggings",
            slug: "girls-jeans-leggings",
            description: "Jeans and leggings for girls.",
            metaTitle: "Girls' Jeans & Leggings",
            metaDescription: "Comfortable jeans and leggings for girls.",
          },
          {
            name: "Skirts & Shorts",
            slug: "girls-skirts-shorts",
            description: "Skirts and shorts for girls.",
            metaTitle: "Girls' Skirts & Shorts",
            metaDescription: "Trendy skirts and shorts for girls.",
          },
          {
            name: "Sweatshirts & Hoodies",
            slug: "girls-sweatshirts-hoodies",
            description: "Sweatshirts and hoodies for girls.",
            metaTitle: "Girls' Sweatshirts & Hoodies",
            metaDescription: "Cozy sweatshirts and hoodies for girls.",
          },
          {
            name: "Jackets",
            slug: "girls-jackets",
            description: "Jackets for girls.",
            metaTitle: "Girls' Jackets",
            metaDescription: "Outerwear jackets for girls.",
          },
          {
            name: "Ethnic Wear",
            slug: "girls-ethnic",
            description: "Ethnic wear for girls.",
            metaTitle: "Girls' Ethnic Wear",
            metaDescription: "Traditional ethnic wear for girls.",
          },
        ],
      },
    ],
  },

  // SHOES
  {
    name: "Shoes",
    slug: "shoes",
    description:
      "Shoes for everyone: sneakers, boots, sandals, heels, and more.",
    metaTitle: "Shoes for Men, Women & Kids",
    metaDescription:
      "Explore a wide collection of shoes for men, women, and kids.",
    children: [
      {
        name: "Sneakers",
        slug: "sneakers",
        description: "Urban sneakers for all.",
        metaTitle: "Sneakers",
        metaDescription: "Shop the latest urban sneakers.",
      },
      {
        name: "Casual Shoes",
        slug: "casual-shoes",
        description: "Everyday casual shoes.",
        metaTitle: "Casual Shoes",
        metaDescription: "Comfortable casual shoes.",
      },
      {
        name: "Formal Shoes",
        slug: "formal-shoes",
        description: "Formal shoes for work and events.",
        metaTitle: "Formal Shoes",
        metaDescription: "Dress shoes for men and women.",
      },
      {
        name: "Boots",
        slug: "boots",
        description: "Stylish boots for all seasons.",
        metaTitle: "Boots",
        metaDescription: "Shop urban boots.",
      },
      {
        name: "Loafers",
        slug: "loafers",
        description: "Slip-on loafers for convenience.",
        metaTitle: "Loafers",
        metaDescription: "Comfortable slip-on loafers.",
      },
      {
        name: "Heels & Wedges",
        slug: "heels-wedges",
        description: "Heels and wedges for women.",
        metaTitle: "Heels & Wedges",
        metaDescription: "Stylish heels and wedges.",
      },
      {
        name: "Sandals & Flats",
        slug: "sandals-flats",
        description: "Sandals and flats for comfort.",
        metaTitle: "Sandals & Flats",
        metaDescription: "Breezy sandals and flats.",
      },
      {
        name: "Sports Shoes",
        slug: "sports-shoes",
        description: "Performance sports shoes.",
        metaTitle: "Sports Shoes",
        metaDescription: "Shop sports and running shoes.",
      },
      {
        name: "Slides & Flip-Flops",
        slug: "slides-flipflops",
        description: "Slides and flip-flops for casual wear.",
        metaTitle: "Slides & Flip-Flops",
        metaDescription: "Easy slides and flip-flops.",
      },
      {
        name: "Ballet Flats",
        slug: "ballet-flats",
        description: "Classic ballet flats.",
        metaTitle: "Ballet Flats",
        metaDescription: "Comfortable ballet flats.",
      },
    ],
  },

  // ACCESSORIES
  {
    name: "Accessories",
    slug: "accessories",
    description:
      "Complete your look with our accessories: bags, jewelry, hats, and more.",
    metaTitle: "Fashion Accessories",
    metaDescription:
      "Shop urban fashion accessories: bags, sunglasses, hats, jewelry, and more.",
    children: [
      {
        name: "Bags & Backpacks",
        slug: "bags-backpacks",
        description: "Bags and backpacks for every occasion.",
        metaTitle: "Bags & Backpacks",
        metaDescription: "Functional and stylish bags and backpacks.",
      },
      {
        name: "Jewelry",
        slug: "jewelry",
        description: "Fashion jewelry: earrings, necklaces, and more.",
        metaTitle: "Jewelry",
        metaDescription: "Trendy fashion jewelry.",
      },
      {
        name: "Belts",
        slug: "belts",
        description: "Belts to complete your outfit.",
        metaTitle: "Belts",
        metaDescription: "Stylish belts for men and women.",
      },
      {
        name: "Sunglasses",
        slug: "sunglasses",
        description: "Sunglasses to protect your eyes in style.",
        metaTitle: "Sunglasses",
        metaDescription: "Shop stylish sunglasses.",
      },
      {
        name: "Hats & Caps",
        slug: "hats-caps",
        description: "Hats and caps for sun and style.",
        metaTitle: "Hats & Caps",
        metaDescription: "Functional and trendy hats and caps.",
      },
      {
        name: "Watches",
        slug: "watches",
        description: "Watches to keep you on time.",
        metaTitle: "Watches",
        metaDescription: "Stylish watches for all occasions.",
      },
      {
        name: "Wallets",
        slug: "wallets",
        description: "Wallets to keep your essentials secure.",
        metaTitle: "Wallets",
        metaDescription: "Functional and sleek wallets.",
      },
      {
        name: "Scarves & Stoles",
        slug: "scarves-stoles",
        description: "Scarves and stoles for warmth and style.",
        metaTitle: "Scarves & Stoles",
        metaDescription: "Cozy scarves and elegant stoles.",
      },
      {
        name: "Socks & Tights",
        slug: "socks-tights",
        description: "Comfortable socks and tights.",
        metaTitle: "Socks & Tights",
        metaDescription: "Soft socks and tights for all seasons.",
      },
      {
        name: "Bracelets & Chains",
        slug: "bracelets-chains",
        description: "Bracelets and chains for a finishing touch.",
        metaTitle: "Bracelets & Chains",
        metaDescription: "Fashion bracelets and chains.",
      },
    ],
  },
];
// Seeder Logic
const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    await Category.deleteMany({});
    console.log("Old categories deleted");

    const createCategories = async (categories, parent = null) => {
      for (const cat of categories) {
        const { children, ...categoryData } = cat;
        const category = new Category({
          ...categoryData,
          parent,
        });
        await category.save();
        console.log(`Created: ${category.name}`);

        if (children && children.length > 0) {
          await createCategories(children, category._id);
        }
      }
    };

    await createCategories(categoriesData);
    console.log("All categories seeded!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedCategories();
