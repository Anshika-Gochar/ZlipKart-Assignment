/**
 * src/modules/orders/order.schema.ts
 *
 * Zod validation schemas for the Order/Checkout endpoints.
 *
 * PaymentMethod matches the Prisma enum exactly — we define it
 * here so Zod can validate it at the HTTP layer before any DB work.
 */

import { z } from "zod";
import { PAGINATION } from "../../config/constants";

// ── Place order (checkout) ─────────────────────────────────────
export const placeOrderSchema = z.object({
  addressId: z
    .string({ message: "addressId is required" })
    .uuid("addressId must be a valid UUID"),

  paymentMethod: z
    .enum(["COD", "UPI", "CARD", "NET_BANKING", "WALLET"], {
      message: "paymentMethod must be one of: COD, UPI, CARD, NET_BANKING, WALLET",
    })
    .default("COD"),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

// ── Order list query ───────────────────────────────────────────
export const orderListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().min(1)),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().min(1).max(50)),
});

// ── Order ID route param ───────────────────────────────────────
export const orderIdParamSchema = z.object({
  id: z.string().uuid("Order ID must be a valid UUID"),
});

// ── Inferred types ─────────────────────────────────────────────
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
