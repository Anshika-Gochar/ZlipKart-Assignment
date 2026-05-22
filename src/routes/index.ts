/**
 * src/routes/index.ts
 *
 * Central route aggregator — mounts all feature routes under
 * the versioned API prefix.
 *
 * WHY a central router?
 * ──────────────────────
 * app.ts stays clean: it just mounts ONE router at '/api/v1'.
 * Adding a new feature = adding ONE line here.
 * Versioning the API = adding a v2 router here later.
 *
 * Mount order matters for overlapping paths — more specific
 * routes should come before wildcard ones.
 */

import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import categoryRoutes from "../modules/categories/category.routes";
import productRoutes from "../modules/products/product.routes";
import cartRoutes from "../modules/cart/cart.routes";
import orderRoutes from "../modules/orders/order.routes";
import addressRoutes from "../modules/addresses/address.routes";
import wishlistRoutes from "../modules/wishlist/wishlist.routes";
// import userRoutes from "../modules/users/user.routes";

const router = Router();

// ── Health check ──────────────────────────────────────────────
router.use("/health", healthRoutes);

// ── Feature routes ────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", addressRoutes);
router.use("/wishlist", wishlistRoutes);
// router.use("/users", userRoutes);

export default router;
