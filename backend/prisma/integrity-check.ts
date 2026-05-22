import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const prods = await db.product.findMany({ select: { id: true, slug: true, stock: true, isActive: true, categoryId: true, imageUrls: true } });
  const cats = await db.category.findMany({ select: { id: true, slug: true } });
  const cartItems = await db.cartItem.findMany({ select: { id: true, productId: true } });
  const wishItems = await db.wishlistItem.findMany({ select: { id: true, productId: true } });
  const validIds = new Set(prods.map((p) => p.id));
  const orphanCart = cartItems.filter((c) => !validIds.has(c.productId));
  const orphanWish = wishItems.filter((w) => !validIds.has(w.productId));
  console.log("✅ Products:", prods.length);
  console.log("✅ Categories:", cats.length);
  console.log("🛒 CartItems:", cartItems.length, "| orphaned:", orphanCart.length);
  console.log("💛 WishlistItems:", wishItems.length, "| orphaned:", orphanWish.length);
  const outOfStock = prods.filter((p) => p.stock === 0);
  console.log("❌ Out-of-stock products:", outOfStock.map((p) => p.slug));
  console.log("Sample product IDs:", prods.slice(0, 3).map((p) => p.id));
}

main().catch(console.error).finally(() => db.$disconnect());
