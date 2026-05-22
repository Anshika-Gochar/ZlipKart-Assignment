/**
 * src/modules/categories/category.schema.ts
 *
 * Zod schemas for Category query params.
 * Categories are read-only for public users — no body schemas needed.
 */

import { z } from "zod";

// ── Slug param (used for GET /categories/:slug) ───────────────
export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
});

export type SlugParam = z.infer<typeof slugParamSchema>;
