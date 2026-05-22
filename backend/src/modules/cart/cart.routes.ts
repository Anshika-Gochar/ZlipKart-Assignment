/**
 * src/modules/cart/cart.routes.ts
 *
 * All cart routes are protected — authenticate middleware runs first
 * on the entire router (applied at mount in routes/index.ts).
 *
 * Route registration order:
 *   DELETE /clear   ← specific named path — registered BEFORE /:itemId
 *   GET    /        ← get current cart
 *   POST   /items   ← add item
 *   PATCH  /items/:itemId
 *   DELETE /items/:itemId
 *
 * WHY authenticate on every cart route?
 * ──────────────────────────────────────
 * Cart is 100% user-specific data. An unauthenticated request has
 * no userId and cannot be associated with a cart. Every operation
 * (read, write, delete) requires a verified identity.
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  addItemSchema,
  updateQuantitySchema,
  itemIdParamSchema,
} from "./cart.schema";
import * as cartController from "./cart.controller";

const router = Router();

// Apply authentication to ALL cart routes at the router level
router.use(authenticate);

// ── GET /api/v1/cart ──────────────────────────────────────────
router.get("/", cartController.getCart);

// ── POST /api/v1/cart/items ───────────────────────────────────
router.post(
  "/items",
  validate({ body: addItemSchema }),
  cartController.addToCart
);

// ── DELETE /api/v1/cart/clear ─────────────────────────────────
// MUST be before /items/:itemId to avoid "clear" matching itemId param
router.delete("/clear", cartController.clearCart);

// ── PATCH /api/v1/cart/items/:itemId ─────────────────────────
router.patch(
  "/items/:itemId",
  validate({ params: itemIdParamSchema, body: updateQuantitySchema }),
  cartController.updateItemQuantity
);

// ── DELETE /api/v1/cart/items/:itemId ────────────────────────
router.delete(
  "/items/:itemId",
  validate({ params: itemIdParamSchema }),
  cartController.removeItem
);

export default router;
