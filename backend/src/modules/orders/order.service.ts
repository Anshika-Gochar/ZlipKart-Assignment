/**
 * src/modules/orders/order.service.ts
 *
 * Order Business Logic Layer — the most critical service in the system.
 *
 * ─────────────────────────────────────────────────────────────
 * THE CHECKOUT TRANSACTION: Why every step is atomic
 * ─────────────────────────────────────────────────────────────
 * A checkout touches MULTIPLE tables in sequence:
 *   1. Read cart + validate stock
 *   2. INSERT orders
 *   3. INSERT order_items (N rows)
 *   4. UPDATE products (stock decrement, N times)
 *   5. DELETE cart_items
 *
 * Without a transaction:
 *   - Crash after step 2 → Order exists but no items, no stock deducted
 *   - Crash after step 3 → Items recorded but stock not deducted → oversell
 *   - Crash after step 4 → Stock deducted but cart not cleared → double order
 *
 * With db.$transaction():
 *   - ALL steps succeed → committed to DB
 *   - ANY failure → ALL changes rolled back as if they never happened
 *   - PostgreSQL guarantees this via its MVCC isolation mechanism
 *
 * ─────────────────────────────────────────────────────────────
 * OVERSELL PROTECTION: updateMany with stock guard
 * ─────────────────────────────────────────────────────────────
 * Instead of:
 *   UPDATE products SET stock = stock - qty WHERE id = ?
 *   (Can go negative if concurrent orders)
 *
 * We use:
 *   UPDATE products SET stock = stock - qty
 *   WHERE id = ? AND stock >= qty        ← Guard clause
 *
 * If stock was sold by a concurrent order between our read and
 * our update, `count` = 0 → we detect the race and throw.
 */

import db from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { PlaceOrderInput, OrderListQuery } from "./order.schema";
import {
  findOrdersByUserId,
  findOrderByIdAndUser,
  findAddressByIdAndUser,
} from "./order.repository";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "../../services/email/resend.service";

// ─────────────────────────────────────────────────────────────
// PLACE ORDER (Checkout)
// ─────────────────────────────────────────────────────────────
export const placeOrder = async (userId: string, input: PlaceOrderInput) => {
  const { addressId, paymentMethod, notes } = input;

  // ── Pre-transaction validations ───────────────────────────
  // These run OUTSIDE the transaction for cleaner error messages.
  // They're safe to run outside because:
  //  - Address check: addresses don't change during checkout
  //  - Cart check: we re-validate stock INSIDE the transaction

  // 1. Verify address belongs to this user
  const address = await findAddressByIdAndUser(addressId, userId);
  if (!address) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Address not found. Please add a delivery address first."
    );
  }

  // 2. Verify user has a cart with items
  const cart = await db.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              discountPrice: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Your cart is empty. Add items before placing an order."
    );
  }

  // 3. Pre-validate all items (gives friendly errors before the transaction)
  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `"${item.product.name}" is no longer available and cannot be ordered.`
      );
    }
    if (item.product.stock < item.quantity) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Insufficient stock for "${item.product.name}". ` +
          `Available: ${item.product.stock}, In cart: ${item.quantity}.`
      );
    }
  }

  // 4. Calculate total (server-side — never trust client)
  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.discountPrice) * item.quantity;
  }, 0);

  // ── THE TRANSACTION ───────────────────────────────────────
  // All DB writes happen atomically inside this block.
  // If any operation throws, Prisma rolls back ALL changes.
  const order = await db.$transaction(async (tx) => {
    // ── Step A: Re-validate stock inside the transaction ────
    // Critical: another user may have purchased between our
    // pre-check and now. We re-check with a fresh read.
    for (const item of cart.items) {
      const freshProduct = await tx.product.findUnique({
        where: { id: item.product.id },
        select: { stock: true, name: true },
      });

      if (!freshProduct || freshProduct.stock < item.quantity) {
        // Throw inside $transaction → automatic rollback
        throw new ApiError(
          StatusCodes.CONFLICT,
          `"${item.product.name}" just sold out. Please update your cart.`
        );
      }
    }

    // ── Step B: Create the Order record ─────────────────────
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        paymentMethod: paymentMethod as Prisma.OrderCreateInput["paymentMethod"],
        totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
        notes,
        // status: PENDING (default), paymentStatus: UNPAID (default)
      },
    });

    // ── Step C: Create all OrderItems with price snapshot ───
    // priceAtPurchase is the FROZEN price at this exact moment.
    // The product's discountPrice may change tomorrow — this doesn't.
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: new Prisma.Decimal(
          Number(item.product.discountPrice).toFixed(2)
        ),
      })),
    });

    // ── Step D: Deduct stock with oversell protection ────────
    // updateMany with stock >= quantity guard prevents going negative
    // even under concurrent load. If count = 0, the stock was sold
    // out between our re-check and this update (extremely rare but possible).
    for (const item of cart.items) {
      const result = await tx.product.updateMany({
        where: {
          id: item.product.id,
          stock: { gte: item.quantity }, // Guard: only update if stock is sufficient
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (result.count === 0) {
        // Race condition caught — rollback the whole transaction
        throw new ApiError(
          StatusCodes.CONFLICT,
          `"${item.product.name}" stock changed during checkout. Please try again.`
        );
      }
    }

    // ── Step E: Clear the cart ───────────────────────────────
    // Delete cart items (not the Cart row itself — reused for next order)
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });
  // ── Transaction complete ──────────────────────────────────
  // If we're here, all 5 steps succeeded and are committed.

  // Fetch the full order with items and address for the response
  const fullOrder = await findOrderByIdAndUser(order.id, userId);

  // ── Send confirmation email (awaited so we know if it succeeded) ──
  let emailSent = false;
  if (fullOrder?.address) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      emailSent = await sendOrderConfirmationEmail({
        to: user.email,
        customerName: user.name || "Valued Customer",
        orderId: order.id,
        totalAmount: Number(fullOrder.totalAmount),
        items: fullOrder.items.map((item) => ({
          name: item.product?.name ?? "Product",
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
        })),
        address: {
          fullName: fullOrder.address.fullName,
          street: fullOrder.address.street,
          city: fullOrder.address.city,
          state: fullOrder.address.state,
          pincode: fullOrder.address.pincode,
        },
      });
    }
  }

  return { ...fullOrder!, emailSent };
};

// ─────────────────────────────────────────────────────────────
// GET ORDER HISTORY
// ─────────────────────────────────────────────────────────────
export const getOrderHistory = async (
  userId: string,
  query: OrderListQuery
) => {
  const skip = (query.page - 1) * query.limit;
  const { orders, total } = await findOrdersByUserId(userId, skip, query.limit);
  return { orders, total, page: query.page, limit: query.limit };
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE ORDER DETAIL
// ─────────────────────────────────────────────────────────────
export const getOrderDetail = async (userId: string, orderId: string) => {
  const order = await findOrderByIdAndUser(orderId, userId);

  if (!order) {
    // The WHERE clause filters by userId too, so this handles both
    // "order doesn't exist" and "order belongs to another user"
    throw ApiError.notFound("Order");
  }

  return order;
};
