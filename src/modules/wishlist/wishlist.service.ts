/**
 * src/modules/wishlist/wishlist.service.ts
 *
 * Wishlist Business Logic Layer.
 *
 * Business rules:
 *  ✓ Product must exist and be active before adding
 *  ✓ Duplicate prevention — 409 Conflict if already in wishlist
 *  ✓ Ownership enforced via compound WHERE in repository
 *  ✓ Remove is idempotent — no error if already gone
 *  ✗ No Prisma queries — all DB work in repository
 *  ✗ No req/res — controller handles HTTP
 */

import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/ApiError";
import { findProductById } from "../products/product.repository";
import {
  findWishlistItem,
  findWishlistByUserId,
  createWishlistItem,
  deleteWishlistItem,
  WishlistItemWithProduct,
} from "./wishlist.repository";

// ── Wishlist response shape ────────────────────────────────────
export interface WishlistResponse {
  items: WishlistItemWithProduct[];
  totalItems: number;
}

// ─────────────────────────────────────────────────────────────
// ADD TO WISHLIST
// ─────────────────────────────────────────────────────────────
/**
 * Flow:
 *  1. Validate product exists and is active
 *  2. Check if already in wishlist → 409 Conflict
 *  3. Create wishlist item
 *  4. Return updated full wishlist
 */
export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistResponse> => {
  // 1. Product validation
  const product = await findProductById(productId);
  if (!product) {
    throw ApiError.notFound("Product");
  }
  if (!product.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "This product is no longer available"
    );
  }

  // 2. Duplicate check — application-level guard
  const existing = await findWishlistItem(userId, productId);
  if (existing) {
    throw ApiError.conflict("This product is already in your wishlist");
  }

  // 3. Add to wishlist
  await createWishlistItem(userId, productId);

  // 4. Return fresh wishlist
  return getWishlist(userId);
};

// ─────────────────────────────────────────────────────────────
// GET WISHLIST
// ─────────────────────────────────────────────────────────────
export const getWishlist = async (userId: string): Promise<WishlistResponse> => {
  const items = await findWishlistByUserId(userId);
  return { items, totalItems: items.length };
};

// ─────────────────────────────────────────────────────────────
// REMOVE FROM WISHLIST
// ─────────────────────────────────────────────────────────────
/**
 * Idempotent removal — no error if product isn't in the wishlist.
 * Compound WHERE (userId + productId) enforces ownership at DB level.
 * Returns the updated wishlist after removal.
 */
export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistResponse> => {
  const deletedCount = await deleteWishlistItem(userId, productId);

  // Idempotent: if count=0, item was already removed — no error
  // This is intentional UX: double-clicking "remove" doesn't crash
  if (deletedCount === 0) {
    // Item wasn't in wishlist — no-op, return current state
    return getWishlist(userId);
  }

  return getWishlist(userId);
};
