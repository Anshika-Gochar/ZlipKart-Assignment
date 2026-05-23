/**
 * src/modules/products/product.schema.ts
 *
 * Zod validation schemas for Product endpoints.
 *
 * All schemas deal with QUERY PARAMS (strings from URL)
 * and ROUTE PARAMS — not request bodies (products are read-only
 * for public users in this implementation).
 *
 * Query param design:
 * ────────────────────
 * All query params arrive as strings from the URL.
 * e.g. ?page=2&limit=10&minPrice=500&inStock=true
 * Zod coerces them to numbers/booleans where needed.
 */

import { z } from "zod";
import { PAGINATION } from "../../config/constants";

// ── Sort options ───────────────────────────────────────────────
// Strict enum prevents arbitrary sort columns (SQL injection surface)
export const SortByEnum = z.enum([
  "newest",       // ORDER BY createdAt DESC
  "price_asc",    // ORDER BY discountPrice ASC
  "price_desc",   // ORDER BY discountPrice DESC
  "rating",       // ORDER BY rating DESC
]);
export type SortBy = z.infer<typeof SortByEnum>;

// ── Product list query schema ──────────────────────────────────
export const productListQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().min(1, "Page must be at least 1")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_LIMIT))
    .pipe(z.number().min(1).max(PAGINATION.MAX_LIMIT)),

  // Sorting
  sortBy: SortByEnum.optional().default("newest"),

  // Category filter
  categoryId: z.string().uuid("categoryId must be a valid UUID").optional(),

  // Price range filter
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0, "Minimum price cannot be negative").optional()),

  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0, "Maximum price cannot be negative").optional()),

  // Stock filter — ?inStock=true shows only available products
  inStock: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  // Minimum rating filter — ?minRating=4 shows 4★ and above
  minRating: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).max(5).optional()),

  // Brand filter — ?brand=Apple filters to that brand (case-insensitive)
  brand: z
    .string()
    .max(100)
    .optional(),

  // Minimum discount % — ?minDiscount=20 shows 20%+ discounted products
  minDiscount: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).max(100).optional()),

  // Inline search — ?search=laptop searches name/brand/description
  // Lets filters + search combine in a single request
  search: z
    .string()
    .max(200)
    .optional(),
});

// ── Search query schema ────────────────────────────────────────
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query too long")
    .trim(),

  // Search results also support pagination
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().min(1)),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_LIMIT))
    .pipe(z.number().min(1).max(PAGINATION.MAX_LIMIT)),
});

// ── Product by category slug query ────────────────────────────
export const categoryProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().min(1)),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : PAGINATION.DEFAULT_LIMIT))
    .pipe(z.number().min(1).max(PAGINATION.MAX_LIMIT)),

  sortBy: SortByEnum.optional().default("newest"),
});

// ── ID param schema ────────────────────────────────────────────
export const productIdParamSchema = z.object({
  id: z.string().uuid("Product ID must be a valid UUID"),
});

// ── Category slug param schema ─────────────────────────────────
export const categorySlugParamSchema = z.object({
  slug: z.string().min(1),
});

// ── Inferred types ─────────────────────────────────────────────
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type CategoryProductsQuery = z.infer<typeof categoryProductsQuerySchema>;
