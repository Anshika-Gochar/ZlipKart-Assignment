/**
 * src/modules/wishlist/wishlist.routes.ts
 *
 * Wishlist routes — all protected via router-level authenticate.
 *
 * Route design note:
 * ──────────────────
 * Using productId in the URL (not request body) is a REST-idiomatic
 * choice for resource-centric toggle operations:
 *
 *   POST   /wishlist/:productId  → "create this relationship"
 *   DELETE /wishlist/:productId  → "destroy this relationship"
 *   GET    /wishlist             → "show all relationships"
 *
 * No body needed for add/remove — productId in the path IS the
 * entire intent. This makes the API:
 *  - Bookmarkable / cacheable for GET
 *  - Idempotent for DELETE (safe to call multiple times)
 *  - Consistent with REST resource naming
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { productIdParamSchema } from "./wishlist.schema";
import * as wishlistController from "./wishlist.controller";

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

// ── GET /api/v1/wishlist ──────────────────────────────────────
router.get("/", wishlistController.getWishlist);

// ── POST /api/v1/wishlist/:productId ──────────────────────────
router.post(
  "/:productId",
  validate({ params: productIdParamSchema }),
  wishlistController.addToWishlist
);

// ── DELETE /api/v1/wishlist/:productId ────────────────────────
router.delete(
  "/:productId",
  validate({ params: productIdParamSchema }),
  wishlistController.removeFromWishlist
);

export default router;
