/**
 * prisma/seed.ts
 *
 * Database seed script — populates categories and products
 * for development and testing.
 *
 * Run with: npm run prisma:seed
 *
 * Design:
 * ────────
 * Uses `upsert` so the script is idempotent — safe to run
 * multiple times without creating duplicates. If a record with
 * the given unique key exists, it updates; otherwise it creates.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Step 1: Categories ──────────────────────────────────────
  console.log("📁 Creating categories...");

  const electronics = await db.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets, devices, and tech products",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    },
  });

  const mobiles = await db.category.upsert({
    where: { slug: "mobiles" },
    update: {},
    create: {
      name: "Mobiles",
      slug: "mobiles",
      description: "Smartphones and mobile accessories",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      parentId: electronics.id,
    },
  });

  const laptops = await db.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: {
      name: "Laptops",
      slug: "laptops",
      description: "Laptops and computing devices",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
      parentId: electronics.id,
    },
  });

  const fashion = await db.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
      description: "Clothing, footwear and accessories",
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    },
  });

  const mensClothing = await db.category.upsert({
    where: { slug: "mens-clothing" },
    update: {},
    create: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "T-shirts, shirts, jeans and more",
      imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400",
      parentId: fashion.id,
    },
  });

  const homeAppliances = await db.category.upsert({
    where: { slug: "home-appliances" },
    update: {},
    create: {
      name: "Home Appliances",
      slug: "home-appliances",
      description: "Kitchen and home appliances",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    },
  });

  console.log("✓ Categories created\n");

  // ── Step 2: Products ────────────────────────────────────────
  console.log("📦 Creating products...");

  const products = [
    // ── Mobiles ─────────────────────────────────────────────
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        "The most powerful Galaxy phone ever with a built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor. Features a 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate.",
      brand: "Samsung",
      price: 134999,
      discountPrice: 124999,
      stock: 50,
      rating: 4.7,
      reviewCount: 2341,
      categoryId: mobiles.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
      ],
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        "Apple iPhone 15 Pro Max with titanium design, A17 Pro chip, 48MP main camera system with 5x optical zoom, and USB-C with USB 3 speeds. The most capable iPhone ever.",
      brand: "Apple",
      price: 159900,
      discountPrice: 149900,
      stock: 35,
      rating: 4.8,
      reviewCount: 5621,
      categoryId: mobiles.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
      ],
    },
    {
      name: "OnePlus 12",
      slug: "oneplus-12",
      description:
        "OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC charging, and 6.82-inch 2K ProXDR display. Experience next-level performance.",
      brand: "OnePlus",
      price: 79999,
      discountPrice: 64999,
      stock: 80,
      rating: 4.5,
      reviewCount: 1893,
      categoryId: mobiles.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
      ],
    },
    {
      name: "Redmi Note 13 Pro+",
      slug: "redmi-note-13-pro-plus",
      description:
        "Redmi Note 13 Pro+ with 200MP camera, 120W HyperCharge, Dimensity 7200 Ultra, and IP68 water resistance. Premium features at an unbeatable price.",
      brand: "Xiaomi",
      price: 31999,
      discountPrice: 26999,
      stock: 120,
      rating: 4.3,
      reviewCount: 3210,
      categoryId: mobiles.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600",
      ],
    },
    {
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description:
        "Google Pixel 8 Pro with Google Tensor G3 chip, advanced AI features, 50MP main camera, 7 years of software updates, and a stunning 6.7-inch LTPO display.",
      brand: "Google",
      price: 106999,
      discountPrice: 92999,
      stock: 0, // Out of stock — used to test inStock filter
      rating: 4.6,
      reviewCount: 987,
      categoryId: mobiles.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
      ],
    },

    // ── Laptops ──────────────────────────────────────────────
    {
      name: "MacBook Pro 14 M3",
      slug: "macbook-pro-14-m3",
      description:
        "MacBook Pro 14-inch with M3 chip, 18GB unified memory, up to 22 hours of battery life, and a stunning Liquid Retina XDR display. The world's best pro laptop.",
      brand: "Apple",
      price: 168900,
      discountPrice: 159900,
      stock: 25,
      rating: 4.9,
      reviewCount: 1120,
      categoryId: laptops.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      ],
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description:
        "Dell XPS 15 with Intel Core i9-13900H, 32GB RAM, NVIDIA RTX 4070, 15.6-inch OLED display, and 1TB SSD. Perfect for creators and power users.",
      brand: "Dell",
      price: 199990,
      discountPrice: 179990,
      stock: 15,
      rating: 4.6,
      reviewCount: 432,
      categoryId: laptops.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600",
      ],
    },
    {
      name: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-zephyrus-g14",
      description:
        "ASUS ROG Zephyrus G14 gaming laptop with AMD Ryzen 9 8945HS, NVIDIA RTX 4070, 14-inch QHD+ 165Hz display, and AniMe Matrix LED cover.",
      brand: "ASUS",
      price: 149990,
      discountPrice: 129990,
      stock: 30,
      rating: 4.7,
      reviewCount: 756,
      categoryId: laptops.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600",
      ],
    },
    {
      name: "Lenovo ThinkPad X1 Carbon",
      slug: "lenovo-thinkpad-x1-carbon",
      description:
        "Lenovo ThinkPad X1 Carbon Gen 12 with Intel Core Ultra 7, 32GB LPDDR5 RAM, 1TB SSD, and a 14-inch IPS display. The ultimate business ultrabook.",
      brand: "Lenovo",
      price: 149999,
      discountPrice: 134999,
      stock: 20,
      rating: 4.5,
      reviewCount: 312,
      categoryId: laptops.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600",
      ],
    },

    // ── Men's Clothing ───────────────────────────────────────
    {
      name: "Levi's 511 Slim Fit Jeans",
      slug: "levis-511-slim-fit-jeans",
      description:
        "Levi's iconic 511 slim fit jeans in stretch denim. Sits below waist, slim through thigh and leg opening. Perfect for casual and semi-formal occasions.",
      brand: "Levi's",
      price: 3999,
      discountPrice: 2799,
      stock: 200,
      rating: 4.4,
      reviewCount: 8923,
      categoryId: mensClothing.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
      ],
    },
    {
      name: "Allen Solly Regular Fit Shirt",
      slug: "allen-solly-regular-fit-shirt",
      description:
        "Allen Solly men's formal shirt in premium cotton blend. Regular fit with spread collar. Available in multiple colors. Perfect for office and formal occasions.",
      brand: "Allen Solly",
      price: 1799,
      discountPrice: 1199,
      stock: 350,
      rating: 4.2,
      reviewCount: 4521,
      categoryId: mensClothing.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
      ],
    },

    // ── Home Appliances ──────────────────────────────────────
    {
      name: "Dyson V15 Detect Vacuum Cleaner",
      slug: "dyson-v15-detect",
      description:
        "Dyson V15 Detect cordless vacuum with laser dust detection, HEPA filtration, 60-minute run time, and intelligent suction auto-adjustment. The most powerful cordless vacuum.",
      brand: "Dyson",
      price: 69900,
      discountPrice: 59900,
      stock: 45,
      rating: 4.7,
      reviewCount: 2341,
      categoryId: homeAppliances.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      ],
    },
    {
      name: "LG 8 Kg Front Load Washing Machine",
      slug: "lg-8kg-front-load-washing-machine",
      description:
        "LG 8 kg AI Direct Drive front load washing machine with TurboWash 360°, Steam+, 6 Motion Direct Drive, and WiFi connectivity. 10-year motor warranty.",
      brand: "LG",
      price: 54990,
      discountPrice: 44990,
      stock: 60,
      rating: 4.5,
      reviewCount: 1678,
      categoryId: homeAppliances.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600",
      ],
    },
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categoryId: product.categoryId,
        imageUrls: product.imageUrls,
        isActive: true,
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   ${6} categories created`);
  console.log(`   ${products.length} products created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
