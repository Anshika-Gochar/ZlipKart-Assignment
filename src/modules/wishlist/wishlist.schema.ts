/**
 * src/modules/wishlist/wishlist.schema.ts
 *
 * Zod schemas for Wishlist endpoints.
 *
 * The wishlist is product-centric — productId lives in the URL:
 *   POST   /wishlist/:productId  ← add product
 *   DELETE /wishlist/:productId  ← remove product
 *
 * No request body schemas needed — the productId param is everything.
 */

import { z } from "zod";

// ── Route param: product ID ────────────────────────────────────
export const productIdParamSchema = z.object({
  productId: z.string().uuid("productId must be a valid UUID"),
});

export type ProductIdParam = z.infer<typeof productIdParamSchema>;
