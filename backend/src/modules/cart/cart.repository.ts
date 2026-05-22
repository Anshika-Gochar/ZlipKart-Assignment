/**
 * src/modules/cart/cart.repository.ts
 *
 * Data access layer for Cart and CartItem entities.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: findOrCreateCart
 * ─────────────────────────────────────────────────────────────
 * A user's cart is created lazily — only when they first add an
 * item. This avoids creating empty Cart rows for every new user.
 * Prisma's `upsert` (or `findFirst` + `create`) handles this.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: upsertCartItem
 * ─────────────────────────────────────────────────────────────
 * The @@unique([cartId, productId]) constraint on CartItem means
 * Prisma's upsert can use the compound unique field as the
 * lookup key. When the same product is added again:
 *   - If NOT exists → CREATE the row
 *   - If EXISTS     → INCREMENT quantity (not duplicate)
 * This is a single atomic DB operation — no race condition.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: findCartItemById with ownership
 * ─────────────────────────────────────────────────────────────
 * When updating/removing an item, we must verify the item
 * belongs to the requesting user's cart. We fetch the item
 * with its cart (which has userId) and check ownership in
 * the service layer.
 */

import db from "../../config/db";
import { Prisma } from "@prisma/client";

// ── Reusable product select inside cart items ─────────────────
// Only the fields needed to display the cart and compute totals
const cartItemProductSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,           // MRP — needed for savings calculation
  discountPrice: true,   // Selling price — needed for subtotal
  stock: true,           // Needed for stock validation on update
  imageUrls: true,       // First image shown in cart UI
  isActive: true,        // Filter out deleted products
} satisfies Prisma.ProductSelect;

// ── Reusable cart item select ─────────────────────────────────
const cartItemSelect = {
  id: true,
  quantity: true,
  cartId: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
  product: { select: cartItemProductSelect },
} satisfies Prisma.CartItemSelect;

// ── Return types inferred from Prisma selects ─────────────────
export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  select: typeof cartItemSelect;
}>;

// ── Find or create a cart for a user ─────────────────────────
// Called every time an item is added — creates cart on first use.
// Uses upsert with the @unique userId constraint.
export const findOrCreateCart = async (userId: string) => {
  return db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},           // No-op if cart already exists
    select: { id: true, userId: true },
  });
};

// ── Get cart with all items and product details ───────────────
// The primary query for GET /cart — includes everything needed
// to render the cart UI and compute totals.
export const findCartWithItems = async (userId: string) => {
  return db.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      updatedAt: true,
      items: {
        select: cartItemSelect,
        orderBy: { createdAt: "asc" }, // Stable order: first added → first shown
      },
    },
  });
};

// ── Find a specific cart item by its ID ──────────────────────
// Includes cart.userId for ownership verification in the service
export const findCartItemById = async (itemId: string) => {
  return db.cartItem.findUnique({
    where: { id: itemId },
    select: {
      ...cartItemSelect,
      cart: { select: { id: true, userId: true } }, // Ownership check
    },
  });
};

// ── Find a cart item by product within a cart ─────────────────
// Used before add-to-cart to check if product already exists
export const findCartItemByProduct = async (cartId: string, productId: string) => {
  return db.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
    select: { id: true, quantity: true },
  });
};

// ── Upsert a cart item (create or increment quantity) ─────────
// ATOMIC: uses the @@unique([cartId, productId]) compound key.
// If the product is already in the cart, quantity is incremented
// rather than creating a duplicate row.
export const upsertCartItem = async (
  cartId: string,
  productId: string,
  quantity: number
) => {
  return db.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    create: { cartId, productId, quantity },
    update: { quantity: { increment: quantity } },
    select: cartItemSelect,
  });
};

// ── Set exact quantity (used for PATCH /cart/items/:itemId) ───
export const setCartItemQuantity = async (itemId: string, quantity: number) => {
  return db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    select: cartItemSelect,
  });
};

// ── Remove a single cart item ────────────────────────────────
export const removeCartItem = async (itemId: string) => {
  return db.cartItem.delete({ where: { id: itemId } });
};

// ── Clear all items from a cart ───────────────────────────────
export const clearCartItems = async (cartId: string) => {
  return db.cartItem.deleteMany({ where: { cartId } });
};
