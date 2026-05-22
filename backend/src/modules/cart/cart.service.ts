/**
 * src/modules/cart/cart.service.ts
 *
 * Cart Business Logic Layer.
 *
 * This layer handles:
 *  ✓ Product existence & active status validation
 *  ✓ Stock availability checks (before add AND update)
 *  ✓ Ownership verification (user can only modify their own cart)
 *  ✓ Cart total calculations (subtotal, savings, item count)
 *  ✓ Compound quantity cap (existing + new ≤ stock AND ≤ max per item)
 *  ✗ No Prisma queries — all DB access via repository
 *  ✗ No req/res — all HTTP concerns in controller
 */

import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/ApiError";
import { findProductById } from "../products/product.repository";
import { CART } from "../../config/constants";
import {
  findOrCreateCart,
  findCartWithItems,
  findCartItemById,
  findCartItemByProduct,
  upsertCartItem,
  setCartItemQuantity,
  removeCartItem,
  clearCartItems,
  CartItemWithProduct,
} from "./cart.repository";
import { AddItemInput, UpdateQuantityInput } from "./cart.schema";

// ── Cart summary shape ─────────────────────────────────────────
// Computed server-side — never trust client-computed totals
export interface CartSummary {
  totalProducts: number; // Distinct product count
  totalItems: number;    // Sum of all quantities
  subtotal: number;      // Sum of (discountPrice × quantity)
  totalSavings: number;  // Sum of ((MRP - discountPrice) × quantity)
}

// ── Cart response shape ────────────────────────────────────────
export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  summary: CartSummary;
  updatedAt: Date;
}

// ── Helper: compute cart summary from items ───────────────────
// Centralised here so every endpoint returns the same totals.
// Prisma returns Decimal for price fields — convert to Number for math.
const computeSummary = (items: CartItemWithProduct[]): CartSummary => {
  let subtotal = 0;
  let totalSavings = 0;
  let totalItems = 0;

  for (const item of items) {
    const discountPrice = Number(item.product.discountPrice);
    const mrp = Number(item.product.price);
    const qty = item.quantity;

    subtotal += discountPrice * qty;
    totalSavings += (mrp - discountPrice) * qty;
    totalItems += qty;
  }

  return {
    totalProducts: items.length,
    totalItems,
    subtotal: Math.round(subtotal * 100) / 100,      // 2 decimal places
    totalSavings: Math.round(totalSavings * 100) / 100,
  };
};

// ── Helper: build full CartResponse from DB result ───────────
const buildCartResponse = (
  cart: NonNullable<Awaited<ReturnType<typeof findCartWithItems>>>
): CartResponse => ({
  id: cart.id,
  userId: cart.userId,
  items: cart.items,
  summary: computeSummary(cart.items),
  updatedAt: cart.updatedAt,
});

// ─────────────────────────────────────────────────────────────
// ADD TO CART
// ─────────────────────────────────────────────────────────────
/**
 * Add a product to the authenticated user's cart.
 *
 * Flow:
 *  1. Validate product exists and is active
 *  2. Check sufficient stock for requested quantity
 *  3. Find or create the user's cart (lazy creation)
 *  4. If product already in cart → check combined qty ≤ stock & cap
 *  5. Upsert the item (atomic create OR increment)
 *  6. Return updated full cart with summary
 */
export const addToCart = async (
  userId: string,
  input: AddItemInput
): Promise<CartResponse> => {
  const { productId, quantity } = input;

  // ── Step 1: Validate product ─────────────────────────────
  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }
  if (!product.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This product is no longer available");
  }

  // ── Step 2: Stock check ──────────────────────────────────
  if (product.stock < quantity) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only ${product.stock} unit(s) available in stock`
    );
  }

  // ── Step 3: Find or create cart ──────────────────────────
  const cart = await findOrCreateCart(userId);

  // ── Step 4: Check existing quantity in cart ───────────────
  const existingItem = await findCartItemByProduct(cart.id, productId);
  if (existingItem) {
    const newTotal = existingItem.quantity + quantity;

    // Guard 1: combined quantity exceeds available stock
    if (newTotal > product.stock) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot add ${quantity} more. You already have ${existingItem.quantity} in cart ` +
          `and only ${product.stock} are available.`
      );
    }

    // Guard 2: combined quantity exceeds per-item cap
    if (newTotal > CART.MAX_QUANTITY_PER_ITEM) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `You can add at most ${CART.MAX_QUANTITY_PER_ITEM} units of the same product`
      );
    }
  }

  // ── Step 5: Upsert item (atomic: create or increment) ────
  await upsertCartItem(cart.id, productId, quantity);

  // ── Step 6: Return refreshed full cart ───────────────────
  const updatedCart = await findCartWithItems(userId);
  return buildCartResponse(updatedCart!);
};

// ─────────────────────────────────────────────────────────────
// GET CART
// ─────────────────────────────────────────────────────────────
/**
 * Fetch the authenticated user's cart with all items and summary.
 * Returns an empty cart structure if the user has no cart yet.
 */
export const getCart = async (userId: string): Promise<CartResponse> => {
  const cart = await findCartWithItems(userId);

  // Return empty cart structure — no 404 (empty cart is valid)
  if (!cart) {
    return {
      id: "",
      userId,
      items: [],
      summary: { totalProducts: 0, totalItems: 0, subtotal: 0, totalSavings: 0 },
      updatedAt: new Date(),
    };
  }

  return buildCartResponse(cart);
};

// ─────────────────────────────────────────────────────────────
// UPDATE ITEM QUANTITY
// ─────────────────────────────────────────────────────────────
/**
 * Set exact quantity for a cart item.
 * Validates ownership — users can only update their own cart items.
 */
export const updateItemQuantity = async (
  userId: string,
  itemId: string,
  input: UpdateQuantityInput
): Promise<CartResponse> => {
  const { quantity } = input;

  // ── Find item + ownership check ───────────────────────────
  const item = await findCartItemById(itemId);

  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
  }

  // Security: ensure the item belongs to the authenticated user's cart
  if (item.cart.userId !== userId) {
    throw ApiError.forbidden("You do not have permission to modify this cart item");
  }

  // ── Stock validation ──────────────────────────────────────
  if (quantity > item.product.stock) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only ${item.product.stock} unit(s) available in stock`
    );
  }

  // ── Update to exact quantity ──────────────────────────────
  await setCartItemQuantity(itemId, quantity);

  const updatedCart = await findCartWithItems(userId);
  return buildCartResponse(updatedCart!);
};

// ─────────────────────────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────────────────────────
/**
 * Remove a single item from the cart.
 * Validates ownership before deletion.
 */
export const removeItem = async (
  userId: string,
  itemId: string
): Promise<CartResponse> => {
  const item = await findCartItemById(itemId);

  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart item not found");
  }

  if (item.cart.userId !== userId) {
    throw ApiError.forbidden("You do not have permission to remove this cart item");
  }

  await removeCartItem(itemId);

  const updatedCart = await findCartWithItems(userId);
  // Cart exists (other items may remain), return updated state
  return updatedCart
    ? buildCartResponse(updatedCart)
    : { id: "", userId, items: [], summary: { totalProducts: 0, totalItems: 0, subtotal: 0, totalSavings: 0 }, updatedAt: new Date() };
};

// ─────────────────────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────────────────────
/**
 * Remove ALL items from the user's cart.
 * The Cart record itself is kept (just emptied) for future use.
 */
export const clearCart = async (userId: string): Promise<CartResponse> => {
  const cart = await findCartWithItems(userId);

  if (!cart || cart.items.length === 0) {
    // Nothing to clear — not an error
    return {
      id: cart?.id ?? "",
      userId,
      items: [],
      summary: { totalProducts: 0, totalItems: 0, subtotal: 0, totalSavings: 0 },
      updatedAt: new Date(),
    };
  }

  await clearCartItems(cart.id);

  return {
    id: cart.id,
    userId,
    items: [],
    summary: { totalProducts: 0, totalItems: 0, subtotal: 0, totalSavings: 0 },
    updatedAt: new Date(),
  };
};
