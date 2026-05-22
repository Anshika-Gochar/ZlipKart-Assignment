/**
 * prisma/seed.ts
 *
 * Curated high-quality ecommerce dataset — ~48 products.
 *
 * Run with:  npm run prisma:seed
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Step 1: Upsert all categories ──────────────────────────────
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

  const sports = await db.category.upsert({
    where: { slug: "sports" },
    update: {},
    create: {
      name: "Sports & Fitness",
      slug: "sports",
      description: "Sports equipment, gym accessories and fitness gear",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    },
  });

  const grocery = await db.category.upsert({
    where: { slug: "grocery" },
    update: {},
    create: {
      name: "Grocery",
      slug: "grocery",
      description: "Everyday essentials, snacks and beverages",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
    },
  });

  const beauty = await db.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: {
      name: "Beauty & Personal Care",
      slug: "beauty",
      description: "Skincare, haircare, makeup and grooming",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    },
  });

  const toys = await db.category.upsert({
    where: { slug: "toys" },
    update: {},
    create: {
      name: "Toys & Games",
      slug: "toys",
      description: "Toys, board games and hobby kits",
      imageUrl: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400",
    },
  });

  const homeKitchen = await db.category.upsert({
    where: { slug: "home-kitchen" },
    update: {},
    create: {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Cookware, storage, furnishing and décor",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    },
  });

  const books = await db.category.upsert({
    where: { slug: "books" },
    update: {},
    create: {
      name: "Books",
      slug: "books",
      description: "Fiction, non-fiction, textbooks and more",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
  });

  // Subcategories
  const mobiles = await db.category.upsert({
    where: { slug: "mobiles" },
    update: {},
    create: { name: "Mobiles", slug: "mobiles", description: "Smartphones", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", parentId: electronics.id },
  });

  const laptops = await db.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: { name: "Laptops", slug: "laptops", description: "Laptops", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", parentId: electronics.id },
  });

  const headphones = await db.category.upsert({
    where: { slug: "headphones" },
    update: {},
    create: { name: "Headphones & Earbuds", slug: "headphones", description: "Audio", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", parentId: electronics.id },
  });

  const smartwatches = await db.category.upsert({
    where: { slug: "smartwatches" },
    update: {},
    create: { name: "Smartwatches", slug: "smartwatches", description: "Wearables", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", parentId: electronics.id },
  });

  const mensClothing = await db.category.upsert({
    where: { slug: "mens-clothing" },
    update: {},
    create: { name: "Men's Clothing", slug: "mens-clothing", description: "Men's Apparel", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400", parentId: fashion.id },
  });

  const womensClothing = await db.category.upsert({
    where: { slug: "womens-clothing" },
    update: {},
    create: { name: "Women's Clothing", slug: "womens-clothing", description: "Women's Apparel", imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400", parentId: fashion.id },
  });

  const footwear = await db.category.upsert({
    where: { slug: "footwear" },
    update: {},
    create: { name: "Footwear", slug: "footwear", description: "Shoes", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", parentId: fashion.id },
  });

  console.log("✓ Categories created\n");

  // ── Step 2: Clear stale products and their dependents ─────────
  // Must delete in FK dependency order:
  //   cart_items → wishlist_items → products
  // (order_items must NOT be deleted to preserve order history)
  console.log("🧹 Clearing stale product data in FK-safe order...");
  await db.cartItem.deleteMany({});       // cart_items FK → products
  await db.wishlistItem.deleteMany({});   // wishlist_items FK → products
  // Only delete products NOT referenced by any order_items
  const referencedIds = await db.orderItem.findMany({ select: { productId: true } });
  const refSet = new Set(referencedIds.map((r) => r.productId));
  const allProducts = await db.product.findMany({ select: { id: true } });
  const deletable = allProducts.map((p) => p.id).filter((id) => !refSet.has(id));
  if (deletable.length > 0) {
    await db.product.deleteMany({ where: { id: { in: deletable } } });
  }
  console.log("✓ Stale data cleared\n");

  // ── Step 3: Products ────────────────────────────────────────────
  console.log("📦 Creating curated products...\n");

  const products = [
    // --- ELECTRONICS (12 products) ---
    {
      name: "Apple iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Titanium design, A17 Pro chip, 48MP camera system. The most capable iPhone ever made.",
      brand: "Apple", price: 159900, discountPrice: 149900, stock: 35, rating: 4.8, reviewCount: 5621,
      categoryId: mobiles.id,
      imageUrls: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600"],
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "200MP camera, Snapdragon 8 Gen 3, and 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate.",
      brand: "Samsung", price: 134999, discountPrice: 124999, stock: 50, rating: 4.7, reviewCount: 2341,
      categoryId: mobiles.id,
      imageUrls: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600", "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600"],
    },
    {
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description: "Google Tensor G3, advanced AI camera features, 50MP main camera, 7 years of OS updates.",
      brand: "Google", price: 106999, discountPrice: 92999, stock: 20, rating: 4.6, reviewCount: 987,
      categoryId: mobiles.id,
      imageUrls: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600", "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=600"],
    },
    {
      name: "Apple MacBook Pro 14 M3",
      slug: "macbook-pro-14-m3",
      description: "M3 chip, 18GB unified memory, up to 22 hours battery life, Liquid Retina XDR display.",
      brand: "Apple", price: 168900, discountPrice: 159900, stock: 25, rating: 4.9, reviewCount: 1120,
      categoryId: laptops.id,
      imageUrls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600"],
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description: "Intel Core i9, 32GB RAM, RTX 4070, 15.6-inch OLED display, 1TB SSD. Perfect for creators.",
      brand: "Dell", price: 199990, discountPrice: 179990, stock: 15, rating: 4.6, reviewCount: 432,
      categoryId: laptops.id,
      imageUrls: ["https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600", "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"],
    },
    {
      name: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-zephyrus-g14",
      description: "AMD Ryzen 9, RTX 4070, 14-inch QHD+ 165Hz display. Portable gaming powerhouse.",
      brand: "ASUS", price: 149990, discountPrice: 129990, stock: 30, rating: 4.7, reviewCount: 756,
      categoryId: laptops.id,
      imageUrls: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600", "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600"],
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise cancellation, 30-hour battery, multipoint connection.",
      brand: "Sony", price: 34990, discountPrice: 24990, stock: 80, rating: 4.8, reviewCount: 7823,
      categoryId: headphones.id,
      imageUrls: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600", "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=600"],
    },
    {
      name: "Apple AirPods Pro 2nd Gen",
      slug: "apple-airpods-pro-2",
      description: "H2 chip, Adaptive ANC, Transparency mode, Adaptive Audio, MagSafe charging case.",
      brand: "Apple", price: 24900, discountPrice: 19900, stock: 60, rating: 4.7, reviewCount: 12345,
      categoryId: headphones.id,
      imageUrls: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600", "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600"],
    },
    {
      name: "boAt Rockerz 550 Wireless",
      slug: "boat-rockerz-550",
      description: "40mm dynamic drivers, 20-hour playtime, soft padded earcups, built-in mic.",
      brand: "boAt", price: 3990, discountPrice: 1799, stock: 300, rating: 4.1, reviewCount: 18456,
      categoryId: headphones.id,
      imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"],
    },
    {
      name: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      description: "S9 chip, Double Tap gesture, Always-On Retina display, blood oxygen, ECG.",
      brand: "Apple", price: 41900, discountPrice: 38900, stock: 45, rating: 4.8, reviewCount: 6789,
      categoryId: smartwatches.id,
      imageUrls: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"],
    },
    {
      name: "Samsung Galaxy Watch 6",
      slug: "samsung-galaxy-watch-6",
      description: "Advanced sleep coaching, body composition analysis, BioActive sensor.",
      brand: "Samsung", price: 24999, discountPrice: 18999, stock: 70, rating: 4.4, reviewCount: 3456,
      categoryId: smartwatches.id,
      imageUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600"],
    },
    {
      name: "Garmin Venu 3",
      slug: "garmin-venu-3",
      description: "AMOLED display, 14-day battery, advanced sleep tracking, sports-grade accuracy.",
      brand: "Garmin", price: 44999, discountPrice: 38999, stock: 25, rating: 4.7, reviewCount: 1234,
      categoryId: smartwatches.id,
      imageUrls: ["https://images.unsplash.com/photo-1617394854215-3c1be3f48fd9?w=600", "https://images.unsplash.com/photo-1529946179074-87642f6204d7?w=600"],
    },

    // --- FASHION (8 products) ---
    {
      name: "Allen Solly Men's Polo T-Shirt",
      slug: "allen-solly-polo-tshirt",
      description: "Classic fit polo t-shirt in breathable cotton blend. Perfect for casual Fridays.",
      brand: "Allen Solly", price: 1499, discountPrice: 899, stock: 150, rating: 4.2, reviewCount: 342,
      categoryId: mensClothing.id,
      imageUrls: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600", "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600"],
    },
    {
      name: "Levi's Men's 511 Slim Fit Jeans",
      slug: "levis-511-slim-jeans",
      description: "A modern slim with room to move. Added stretch for all-day comfort.",
      brand: "Levi's", price: 3299, discountPrice: 2149, stock: 200, rating: 4.6, reviewCount: 1250,
      categoryId: mensClothing.id,
      imageUrls: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600"],
    },
    {
      name: "Zara Women's Floral Print Dress",
      slug: "zara-floral-dress",
      description: "Midi dress featuring a V-neckline, long sleeves, and an elastic waistband.",
      brand: "Zara", price: 2990, discountPrice: 1990, stock: 80, rating: 4.4, reviewCount: 560,
      categoryId: womensClothing.id,
      imageUrls: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600", "https://images.unsplash.com/photo-1515347619152-3cb0b7a66f54?w=600"],
    },
    {
      name: "H&M Oversized Cotton Shirt",
      slug: "hm-oversized-shirt",
      description: "Long-sleeved shirt in crisp cotton poplin with a collar and buttons down the front.",
      brand: "H&M", price: 1499, discountPrice: 1299, stock: 120, rating: 4.3, reviewCount: 890,
      categoryId: womensClothing.id,
      imageUrls: ["https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600", "https://images.unsplash.com/photo-1596783046220-9c043e7428f5?w=600"],
    },
    {
      name: "Biba Women's Kurta Set",
      slug: "biba-kurta-set",
      description: "Elegant straight fit printed cotton kurta set with matching palazzos.",
      brand: "Biba", price: 3999, discountPrice: 2499, stock: 60, rating: 4.5, reviewCount: 420,
      categoryId: womensClothing.id,
      imageUrls: ["https://images.unsplash.com/photo-1583391733958-611593c66f54?w=600", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"],
    },
    {
      name: "Nike Air Force 1 '07",
      slug: "nike-air-force-1",
      description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
      brand: "Nike", price: 7495, discountPrice: 7495, stock: 40, rating: 4.8, reviewCount: 8900,
      categoryId: footwear.id,
      imageUrls: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"],
    },
    {
      name: "Puma Ultraride Running Shoes",
      slug: "puma-ultraride-shoes",
      description: "Lightweight and airy running shoes providing optimal cushioning.",
      brand: "Puma", price: 5999, discountPrice: 2999, stock: 90, rating: 4.3, reviewCount: 1540,
      categoryId: footwear.id,
      imageUrls: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    },
    {
      name: "Clarks Women's Leather Loafers",
      slug: "clarks-leather-loafers",
      description: "Premium leather loafers featuring OrthoLite footbed for all-day comfort.",
      brand: "Clarks", price: 4999, discountPrice: 3499, stock: 50, rating: 4.6, reviewCount: 320,
      categoryId: footwear.id,
      imageUrls: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600"],
    },

    // --- SPORTS & FITNESS (6 products) ---
    {
      name: "Yonex Astrox Lite 21i Badminton Racquet",
      slug: "yonex-astrox-lite-21i",
      description: "Lightweight, head-heavy graphite racquet for aggressive smashes and quick returns.",
      brand: "Yonex", price: 2990, discountPrice: 1699, stock: 120, rating: 4.5, reviewCount: 3450,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600", "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600"],
    },
    {
      name: "Nivia Storm Football - Size 5",
      slug: "nivia-storm-football",
      description: "Durable rubber outer material football suitable for hard ground conditions.",
      brand: "Nivia", price: 550, discountPrice: 420, stock: 300, rating: 4.2, reviewCount: 8900,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600", "https://images.unsplash.com/photo-1508344928928-7137b29de218?w=600"],
    },
    {
      name: "Boldfit Yoga Mat 6mm",
      slug: "boldfit-yoga-mat-6mm",
      description: "Anti-slip yoga mat with alignment lines. Made from eco-friendly TPE material.",
      brand: "Boldfit", price: 1499, discountPrice: 699, stock: 250, rating: 4.4, reviewCount: 12450,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600", "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600"],
    },
    {
      name: "Decathlon 10kg Adjustable Dumbbell Set",
      slug: "decathlon-10kg-dumbbell-set",
      description: "Perfect for home workouts. Adjustable cast iron weight plates with spinlock collars.",
      brand: "Decathlon", price: 2499, discountPrice: 1999, stock: 80, rating: 4.7, reviewCount: 2100,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1586401700818-18e3a2468d6f?w=600", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"],
    },
    {
      name: "Optimum Nutrition Gold Standard Whey 2lbs",
      slug: "on-gold-standard-whey-2lbs",
      description: "100% Whey Protein Isolate. 24g of protein per serving to support muscle recovery.",
      brand: "Optimum Nutrition", price: 3899, discountPrice: 3099, stock: 150, rating: 4.6, reviewCount: 45600,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600", "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600"],
    },
    {
      name: "Strauss Bicycle Helmet",
      slug: "strauss-bicycle-helmet",
      description: "Lightweight and breathable cycling helmet with adjustable straps for safety.",
      brand: "Strauss", price: 1299, discountPrice: 799, stock: 100, rating: 4.1, reviewCount: 890,
      categoryId: sports.id,
      imageUrls: ["https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600", "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?w=600"],
    },

    // --- BEAUTY & PERSONAL CARE (6 products) ---
    {
      name: "Minimalist 10% Vitamin C Face Serum",
      slug: "minimalist-vitamin-c-serum",
      description: "Highly stable Vitamin C face serum for glowing skin. Reduces dullness and dark spots.",
      brand: "Minimalist", price: 699, discountPrice: 664, stock: 400, rating: 4.5, reviewCount: 15400,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600", "https://images.unsplash.com/photo-1617897903246-719242758050?w=600"],
    },
    {
      name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum",
      slug: "loreal-hyaluronic-serum",
      description: "Intensely hydrates, plumps the skin and reduces fine lines.",
      brand: "L'Oreal Paris", price: 999, discountPrice: 799, stock: 250, rating: 4.4, reviewCount: 8900,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600", "https://images.unsplash.com/photo-1608223668853-eb872eb1f486?w=600"],
    },
    {
      name: "M.A.C Ruby Woo Matte Lipstick",
      slug: "mac-ruby-woo-lipstick",
      description: "Iconic vivid blue-red matte lipstick. Long-wearing and highly pigmented.",
      brand: "M.A.C", price: 1950, discountPrice: 1950, stock: 120, rating: 4.8, reviewCount: 5600,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600", "https://images.unsplash.com/photo-1571781537021-d6365ad4ce57?w=600"],
    },
    {
      name: "Philips Series 3000 Beard Trimmer",
      slug: "philips-series-3000-trimmer",
      description: "Lift & Trim system cuts 30% faster. Stainless steel blades, 45 min cordless use.",
      brand: "Philips", price: 1495, discountPrice: 1199, stock: 300, rating: 4.3, reviewCount: 22000,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1621607512214-68297480165e?w=600", "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600"],
    },
    {
      name: "Plum Green Tea Pore Cleansing Face Wash",
      slug: "plum-green-tea-face-wash",
      description: "Gentle, non-drying foaming face wash for oily, acne-prone skin.",
      brand: "Plum", price: 345, discountPrice: 295, stock: 500, rating: 4.4, reviewCount: 18000,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600", "https://images.unsplash.com/photo-1556228720-1c27bef84672?w=600"],
    },
    {
      name: "Dyson Airwrap Multi-styler",
      slug: "dyson-airwrap",
      description: "Curl, shape, smooth, and hide flyaways with no extreme heat.",
      brand: "Dyson", price: 49900, discountPrice: 45900, stock: 30, rating: 4.7, reviewCount: 1200,
      categoryId: beauty.id,
      imageUrls: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600", "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600"],
    },

    // --- HOME & KITCHEN (6 products) ---
    {
      name: "Pigeon by Stovekraft Favourite Induction Base Pressure Cooker, 3 Litres",
      slug: "pigeon-pressure-cooker-3l",
      description: "Aluminium pressure cooker with induction base. ISI certified for safety.",
      brand: "Pigeon", price: 1195, discountPrice: 699, stock: 250, rating: 4.1, reviewCount: 12500,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1584990347449-a6eb776d6531?w=600", "https://images.unsplash.com/photo-1585228557345-0d04b38dcb96?w=600"],
    },
    {
      name: "Wakefit Orthopedic Memory Foam Mattress",
      slug: "wakefit-memory-foam-mattress",
      description: "Medium firm 6-inch mattress providing optimal spine support.",
      brand: "Wakefit", price: 14999, discountPrice: 11599, stock: 60, rating: 4.6, reviewCount: 35000,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600", "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600"],
    },
    {
      name: "Philips 750W Mixer Grinder",
      slug: "philips-mixer-grinder-750w",
      description: "Powerful 750W motor with 3 stainless steel jars. Advanced air ventilation system.",
      brand: "Philips", price: 4595, discountPrice: 3499, stock: 120, rating: 4.4, reviewCount: 8900,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1585228557345-0d04b38dcb96?w=600", "https://images.unsplash.com/photo-1584990347449-a6eb776d6531?w=600"],
    },
    {
      name: "Bombay Dyeing 100% Cotton Double Bedsheet",
      slug: "bombay-dyeing-cotton-bedsheet",
      description: "Soft, breathable premium cotton double bedsheet with 2 pillow covers.",
      brand: "Bombay Dyeing", price: 1999, discountPrice: 999, stock: 300, rating: 4.3, reviewCount: 4500,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600", "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600"],
    },
    {
      name: "Milton Thermosteel 24 Hours Hot and Cold Water Bottle",
      slug: "milton-thermosteel-bottle-1l",
      description: "1000ml vacuum insulated stainless steel flask. Keeps beverages hot or cold for 24 hours.",
      brand: "Milton", price: 1050, discountPrice: 850, stock: 400, rating: 4.5, reviewCount: 21000,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600", "https://images.unsplash.com/photo-1581783342308-f792db85703f?w=600"],
    },
    {
      name: "Samsung 236 L Double Door Refrigerator",
      slug: "samsung-refrigerator-236l",
      description: "Frost free refrigerator with digital inverter compressor.",
      brand: "Samsung", price: 30990, discountPrice: 24490, stock: 40, rating: 4.4, reviewCount: 3200,
      categoryId: homeKitchen.id,
      imageUrls: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600", "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600"],
    },

    // --- GROCERY (4 products) ---
    {
      name: "Tata Salt, 1kg",
      slug: "tata-salt-1kg",
      description: "Vacuum evaporated iodised salt. India's trusted salt brand.",
      brand: "Tata", price: 28, discountPrice: 26, stock: 1000, rating: 4.8, reviewCount: 56000,
      categoryId: grocery.id,
      imageUrls: ["https://images.unsplash.com/photo-1518110925486-13ca373bc091?w=600", "https://images.unsplash.com/photo-1614059082352-78a7cc0cb225?w=600"],
    },
    {
      name: "Aashirvaad Select Premium Sharbati Atta, 5kg",
      slug: "aashirvaad-sharbati-atta-5kg",
      description: "Premium whole wheat atta made from MP Sharbati wheat.",
      brand: "Aashirvaad", price: 325, discountPrice: 299, stock: 500, rating: 4.7, reviewCount: 23000,
      categoryId: grocery.id,
      imageUrls: ["https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"],
    },
    {
      name: "Maggi 2-Minute Instant Noodles, 12 Pack",
      slug: "maggi-noodles-12-pack",
      description: "The classic Maggi Masala noodles. Quick, easy, and delicious.",
      brand: "Nestle", price: 168, discountPrice: 155, stock: 800, rating: 4.6, reviewCount: 45000,
      categoryId: grocery.id,
      imageUrls: ["https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"],
    },
    {
      name: "Fortune Sunlite Refined Sunflower Oil, 1L",
      slug: "fortune-sunflower-oil-1l",
      description: "Light and healthy refined sunflower oil, fortified with vitamins.",
      brand: "Fortune", price: 150, discountPrice: 135, stock: 600, rating: 4.5, reviewCount: 12000,
      categoryId: grocery.id,
      imageUrls: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600"],
    },

    // --- TOYS & GAMES (3 products) ---
    {
      name: "LEGO Classic Large Creative Brick Box",
      slug: "lego-classic-brick-box",
      description: "790 pieces of colorful LEGO bricks to inspire open-ended building play.",
      brand: "LEGO", price: 5499, discountPrice: 4299, stock: 100, rating: 4.9, reviewCount: 8900,
      categoryId: toys.id,
      imageUrls: ["https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600", "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"],
    },
    {
      name: "Mattel Uno Playing Card Game",
      slug: "mattel-uno-cards",
      description: "The classic family card game of matching colors and numbers.",
      brand: "Mattel", price: 199, discountPrice: 149, stock: 400, rating: 4.7, reviewCount: 25000,
      categoryId: toys.id,
      imageUrls: ["https://images.unsplash.com/photo-1606167851614-2e99f572719a?w=600", "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=600"],
    },
    {
      name: "Funskool Monopoly Board Game",
      slug: "funskool-monopoly",
      description: "Fast-dealing property trading board game for family game night.",
      brand: "Funskool", price: 899, discountPrice: 699, stock: 150, rating: 4.5, reviewCount: 6700,
      categoryId: toys.id,
      imageUrls: ["https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?w=600", "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600"],
    },

    // --- BOOKS (3 products) ---
    {
      name: "Atomic Habits by James Clear",
      slug: "atomic-habits-james-clear",
      description: "An easy and proven way to build good habits and break bad ones.",
      brand: "Penguin", price: 799, discountPrice: 499, stock: 500, rating: 4.8, reviewCount: 85000,
      categoryId: books.id,
      imageUrls: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"],
    },
    {
      name: "The Psychology of Money by Morgan Housel",
      slug: "psychology-of-money",
      description: "Timeless lessons on wealth, greed, and happiness.",
      brand: "Jaico", price: 399, discountPrice: 249, stock: 600, rating: 4.7, reviewCount: 62000,
      categoryId: books.id,
      imageUrls: ["https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600", "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600"],
    },
    {
      name: "Deep Work by Cal Newport",
      slug: "deep-work-cal-newport",
      description: "Rules for focused success in a distracted world.",
      brand: "Piatkus", price: 499, discountPrice: 350, stock: 350, rating: 4.6, reviewCount: 34000,
      categoryId: books.id,
      imageUrls: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600"],
    }
  ];

  // ── Step 4: Insert all products ─────────────────────────────
  let successCount = 0;
  for (const product of products) {
    await db.product.create({
      data: {
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
    successCount++;
  }

  const categoryCount = await db.category.count();
  console.log("\n✅ Seeding complete!");
  console.log(`   📁 ${categoryCount} categories`);
  console.log(`   📦 ${successCount} products with matched images`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
