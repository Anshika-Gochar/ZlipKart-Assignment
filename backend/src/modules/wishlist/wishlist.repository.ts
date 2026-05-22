/**
 * src/modules/wishlist/wishlist.repository.ts
 *
 * Data access layer for WishlistItem.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: No separate Wishlist table
 * ─────────────────────────────────────────────────────────────
 * Unlike Cart (which has a Cart header row + CartItem rows),
 * WishlistItem directly joins User ↔ Product via (userId, productId).
 * The schema comment explains why:
 *   "No separate Wishlist table needed — the items themselves
 *    are owned by the user directly, keeping it simple."
 *
 * Cart needs a header because: Cart has metadata (updatedAt for
 * abandoned-cart detection, potential cart-level discounts).
 * Wishlist needs none of that — it's a pure junction.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Duplicate prevention at two layers
 * ─────────────────────────────────────────────────────────────
 * Layer 1 (Application): findWishlistItem before add → 409 if exists
 * Layer 2 (Database): @@unique([userId, productId]) → DB rejects
 *                     duplicate at constraint level
 *
 * The application check gives a clean, readable error message.
 * The DB constraint is the ultimate safety net — guards against
 * race conditions where two concurrent requests both pass the
 * application check.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Ownership via compound WHERE
 * ─────────────────────────────────────────────────────────────
 * All lookups use WHERE { userId, productId } — ownership is
 * baked into the query. No separate verification step needed.
 */

import db from "../../config/db";
import { Prisma } from "@prisma/client";

// ── Reusable product select inside wishlist items ─────────────
// Optimised for wishlist display — enough to render a product card
const wishlistProductSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  discountPrice: true,
  stock: true,
  rating: true,
  reviewCount: true,
  imageUrls: true,
  isActive: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.ProductSelect;

// ── Reusable wishlist item select ─────────────────────────────
const wishlistItemSelect = {
  id: true,
  userId: true,
  productId: true,
  addedAt: true,
  product: { select: wishlistProductSelect },
} satisfies Prisma.WishlistItemSelect;

// ── Inferred return type ──────────────────────────────────────
export type WishlistItemWithProduct = Prisma.WishlistItemGetPayload<{
  select: typeof wishlistItemSelect;
}>;

// ── Check if a product is already in the wishlist ─────────────
// Uses the compound unique field — single index lookup, O(log n)
export const findWishlistItem = async (
  userId: string,
  productId: string
): Promise<{ id: string } | null> => {
  return db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
};

// ── Get all wishlist items with product details ───────────────
// Sorted newest-first (most recently added product appears first)
export const findWishlistByUserId = async (
  userId: string
): Promise<WishlistItemWithProduct[]> => {
  return db.wishlistItem.findMany({
    where: { userId },
    select: wishlistItemSelect,
    orderBy: { addedAt: "desc" }, // Most recently wishlisted → first
  });
};

// ── Add a product to the wishlist ─────────────────────────────
// Caller has already verified product exists and item doesn't exist
export const createWishlistItem = async (
  userId: string,
  productId: string
): Promise<WishlistItemWithProduct> => {
  return db.wishlistItem.create({
    data: { userId, productId },
    select: wishlistItemSelect,
  });
};

// ── Remove a product from the wishlist ────────────────────────
// deleteMany is used (not delete) so it silently succeeds even if
// the item is already gone — idempotent removal
export const deleteWishlistItem = async (
  userId: string,
  productId: string
): Promise<number> => {
  const result = await db.wishlistItem.deleteMany({
    where: { userId, productId }, // compound WHERE = ownership check
  });
  return result.count; // 1 if deleted, 0 if wasn't in wishlist
};
