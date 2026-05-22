/**
 * src/modules/orders/order.repository.ts
 *
 * Data access layer for Order reads.
 *
 * ─────────────────────────────────────────────────────────────
 * ARCHITECTURE NOTE: Why are writes NOT in this file?
 * ─────────────────────────────────────────────────────────────
 * Order creation is a MULTI-STEP operation involving:
 *   1. Validating cart + stock
 *   2. Creating Order
 *   3. Creating OrderItems (bulk)
 *   4. Decrementing product stock (per item)
 *   5. Clearing cart
 *
 * All five steps MUST succeed together or ALL roll back.
 * This requires a Prisma interactive transaction ($transaction with
 * the tx client parameter), which lives in order.service.ts.
 *
 * Putting the write logic in a repository function would require
 * passing the `tx` client around — that leaks transaction context
 * into the repository layer. Better to keep the transaction boundary
 * entirely within the service, which orchestrates the operation.
 *
 * ─────────────────────────────────────────────────────────────
 * This file only contains safe READ operations.
 * ─────────────────────────────────────────────────────────────
 */

import db from "../../config/db";
import { Prisma } from "@prisma/client";

// ── Reusable order item select ────────────────────────────────
// OrderItem stores priceAtPurchase — this is the historical snapshot.
// Product is included for display (name, image) but its current price
// is intentionally excluded — we always show priceAtPurchase.
const orderItemSelect = {
  id: true,
  quantity: true,
  priceAtPurchase: true, // ← The immutable price snapshot
  productId: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      imageUrls: true, // First image for order confirmation UI
    },
  },
} satisfies Prisma.OrderItemSelect;

// ── Reusable order select ─────────────────────────────────────
const orderSelect = {
  id: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  totalAmount: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  address: {
    select: {
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      pincode: true,
      landmark: true,
    },
  },
  items: { select: orderItemSelect },
} satisfies Prisma.OrderSelect;

// ── Inferred return type ──────────────────────────────────────
export type OrderWithDetails = Prisma.OrderGetPayload<{
  select: typeof orderSelect;
}>;

// ── Get paginated order history for a user ────────────────────
export const findOrdersByUserId = async (
  userId: string,
  skip: number,
  take: number
) => {
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId },
      select: orderSelect,
      orderBy: { createdAt: "desc" }, // Newest orders first
      skip,
      take,
    }),
    db.order.count({ where: { userId } }),
  ]);

  return { orders, total };
};

// ── Get single order by ID with ownership check ───────────────
// The WHERE clause includes BOTH id AND userId — a user cannot
// fetch another user's order even if they know the UUID.
export const findOrderByIdAndUser = async (
  orderId: string,
  userId: string
): Promise<OrderWithDetails | null> => {
  return db.order.findFirst({
    where: { id: orderId, userId }, // Ownership enforced at DB level
    select: orderSelect,
  });
};

// ── Validate that an address belongs to the user ──────────────
// Called before the transaction to give a clear error message
// if the address doesn't exist or belongs to another user.
export const findAddressByIdAndUser = async (
  addressId: string,
  userId: string
) => {
  return db.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true, userId: true },
  });
};
