/**
 * src/modules/products/product.routes.ts
 *
 * Product routes — all public (no authentication needed for reading).
 *
 * ─────────────────────────────────────────────────────────────
 * CRITICAL: Route Registration Order
 * ─────────────────────────────────────────────────────────────
 * Express matches routes top-to-bottom, first match wins.
 *
 * If we register /:id BEFORE /search, then a request to:
 *   GET /products/search?q=iphone
 * Would match /:id with id = "search" — and fail UUID validation.
 *
 * Correct order:
 *   1. GET /search            ← specific named paths first
 *   2. GET /category/:slug    ← specific prefix paths next
 *   3. GET /:id               ← catch-all param routes LAST
 *
 * This is a common Express interview question.
 * ─────────────────────────────────────────────────────────────
 */

import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  productListQuerySchema,
  searchQuerySchema,
  categoryProductsQuerySchema,
  productIdParamSchema,
  categorySlugParamSchema,
} from "./product.schema";
import * as productController from "./product.controller";

const router = Router();

// ── 1. GET /api/v1/products ─────────────────────────────────
// Paginated list with filters: sortBy, categoryId, minPrice, maxPrice, inStock, minRating
router.get(
  "/",
  validate({ query: productListQuerySchema }),
  productController.getProducts
);

// ── 2. GET /api/v1/products/search?q= ───────────────────────
// MUST be before /:id to avoid "search" being treated as a UUID
router.get(
  "/search",
  validate({ query: searchQuerySchema }),
  productController.searchProducts
);

// ── 3. GET /api/v1/products/category/:slug ───────────────────
// MUST be before /:id to avoid "category" being treated as a UUID
router.get(
  "/category/:slug",
  validate({
    params: categorySlugParamSchema,
    query: categoryProductsQuerySchema,
  }),
  productController.getProductsByCategory
);

// ── 4. GET /api/v1/products/:id ─────────────────────────────
// Catch-all param route — registered LAST
router.get(
  "/:id",
  validate({ params: productIdParamSchema }),
  productController.getProductById
);

export default router;
