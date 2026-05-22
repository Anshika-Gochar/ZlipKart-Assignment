/**
 * src/modules/cart/cart.schema.ts
 *
 * Zod validation schemas for all Cart endpoints.
 */

import { z } from "zod";
import { CART } from "../../config/constants";

// ── Add item to cart ───────────────────────────────────────────
export const addItemSchema = z.object({
  productId: z
    .string({ message: "productId is required" })
    .uuid("productId must be a valid UUID"),

  quantity: z
    .number({ message: "quantity must be a number" })
    .int("quantity must be a whole number")
    .min(1, "quantity must be at least 1")
    .max(
      CART.MAX_QUANTITY_PER_ITEM,
      `quantity cannot exceed ${CART.MAX_QUANTITY_PER_ITEM} per item`
    )
    .default(1),
});

// ── Update cart item quantity ──────────────────────────────────
export const updateQuantitySchema = z.object({
  quantity: z
    .number({ message: "quantity must be a number" })
    .int("quantity must be a whole number")
    .min(1, "quantity must be at least 1")
    .max(
      CART.MAX_QUANTITY_PER_ITEM,
      `quantity cannot exceed ${CART.MAX_QUANTITY_PER_ITEM} per item`
    ),
});

// ── Route param: cart item ID ──────────────────────────────────
export const itemIdParamSchema = z.object({
  itemId: z.string().uuid("itemId must be a valid UUID"),
});

// ── Inferred types ─────────────────────────────────────────────
export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
export type ItemIdParam = z.infer<typeof itemIdParamSchema>;
