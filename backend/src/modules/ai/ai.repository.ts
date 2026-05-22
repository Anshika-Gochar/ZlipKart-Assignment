/**
 * src/modules/ai/ai.repository.ts
 *
 * Data access layer for the AI recommendation endpoint.
 *
 * ─────────────────────────────────────────────────────────────
 * Two-mode query strategy:
 *
 * STRICT MODE (category detected):
 *   Fetch ONLY products whose category slug/name matches the
 *   detected category. This guarantees "best headphones" never
 *   returns phones regardless of rating differences.
 *
 * FALLBACK MODE (no category):
 *   Broad OR match across name/brand/description/category.
 *   Falls back to top-rated in-stock products if no keywords.
 *
 * We fetch a larger pool (15 products) so the service layer can
 * apply in-memory weighted scoring and return the best 5.
 * ─────────────────────────────────────────────────────────────
 */

import { Prisma } from "@prisma/client";
import db from "../../config/db";

// ── Reusable select — same shape as product.repository.ts ─────
const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  brand: true,
  price: true,
  discountPrice: true,
  stock: true,
  isActive: true,
  imageUrls: true,
  rating: true,
  reviewCount: true,
  categoryId: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export interface AIQueryParams {
  // STRICT MODE: one or more category slugs to lock query to
  categorySlugs?: string[];

  // FALLBACK: generic keywords to match across name/brand/description
  keywords?: string[];

  // Budget ceiling
  maxPrice?: number;

  // Whether we have strong category confidence (affects OR vs AND strategy)
  strictCategory?: boolean;
}

// ── Strict category-locked fetch ──────────────────────────────
// Returns all active, in-stock products in matching categories.
// Price-filtered if maxPrice set. Ordered by rating for initial
// sort before in-memory scorer takes over.
export const findProductsStrict = async (params: AIQueryParams) => {
  const { categorySlugs = [], maxPrice, keywords = [] } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    stock: { gt: 0 },
  };

  if (maxPrice && maxPrice > 0) {
    where.discountPrice = { lte: new Prisma.Decimal(maxPrice) };
  }

  // Category filter: match any of the target slugs OR names
  const categoryConditions: Prisma.ProductWhereInput[] = categorySlugs.map(
    (slug) => ({
      category: {
        OR: [
          { slug: { contains: slug, mode: "insensitive" } },
          { name: { contains: slug, mode: "insensitive" } },
        ],
      },
    })
  );

  // Also filter by keywords within the category pool for refinement
  // (e.g. "gaming laptop" → laptops category, but prefer gaming keyword matches)
  const keywordConditions: Prisma.ProductWhereInput[] = keywords.flatMap(
    (kw) => [
      { name: { contains: kw, mode: "insensitive" } },
      { brand: { contains: kw, mode: "insensitive" } },
      { description: { contains: kw, mode: "insensitive" } },
    ]
  );

  if (categoryConditions.length > 0 && keywordConditions.length > 0) {
    // Must be in the right category AND optionally keyword-matched
    // We use category as AND, keywords as OR within it
    where.AND = [
      { OR: categoryConditions },
    ];
    // Keywords are used for scoring in-memory, not strict filtering
    // to avoid returning 0 results for "gaming laptop" if no product
    // has "gaming" in description
  } else if (categoryConditions.length > 0) {
    where.OR = categoryConditions;
  } else if (keywordConditions.length > 0) {
    where.OR = keywordConditions;
  }

  return db.product.findMany({
    where,
    select: productSelect,
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
      { stock: "desc" },
    ],
    take: 15, // Larger pool — service scores and trims to 5
  });
};

// ── Fallback broad search ─────────────────────────────────────
// Used when no category is confidently detected.
// Matches across all fields, falls back to top-rated if no keywords.
export const findProductsFallback = async (params: AIQueryParams) => {
  const { keywords = [], maxPrice } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    stock: { gt: 0 },
  };

  if (maxPrice && maxPrice > 0) {
    where.discountPrice = { lte: new Prisma.Decimal(maxPrice) };
  }

  if (keywords.length > 0) {
    where.OR = keywords.flatMap((kw) => [
      { name: { contains: kw, mode: "insensitive" } },
      { brand: { contains: kw, mode: "insensitive" } },
      { description: { contains: kw, mode: "insensitive" } },
      {
        category: {
          OR: [
            { name: { contains: kw, mode: "insensitive" } },
            { slug: { contains: kw, mode: "insensitive" } },
          ],
        },
      },
    ]);
  }
  // If no keywords, just return top-rated in-stock products

  return db.product.findMany({
    where,
    select: productSelect,
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
      { stock: "desc" },
    ],
    take: 15,
  });
};

// Legacy export for backwards compat (not used by new service)
export interface AIQueryParamsLegacy {
  keywords: string[];
  categoryKeywords: string[];
  maxPrice?: number;
}
export const findProductsForAI = findProductsFallback;
