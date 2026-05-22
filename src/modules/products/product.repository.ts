/**
 * src/modules/products/product.repository.ts
 *
 * Data access layer for Product entity.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Dynamic WHERE clause construction
 * ─────────────────────────────────────────────────────────────
 * Prisma's `where` accepts a `ProductWhereInput` object.
 * We build this object dynamically based on which filters
 * are provided — undefined values are ignored by Prisma.
 *
 * This approach:
 * - Generates one optimized SQL query regardless of filter count
 * - Avoids string concatenation (SQL injection safe)
 * - TypeScript ensures only valid filter fields are used
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Parallel count + findMany (Promise.all)
 * ─────────────────────────────────────────────────────────────
 * Pagination requires both the data AND the total count.
 * Running them sequentially wastes time:
 *   await count()   ← 20ms
 *   await findMany() ← 30ms
 *   Total: 50ms
 *
 * Running in parallel cuts it roughly in half:
 *   await Promise.all([count(), findMany()])  ← ~30ms
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Consistent product select
 * ─────────────────────────────────────────────────────────────
 * We include `category` with each product (name + slug only).
 * This adds one JOIN but avoids a second round-trip from the
 * frontend to look up the category name.
 */

import { Prisma } from "@prisma/client";
import db from "../../config/db";
import { SortBy } from "./product.schema";

// ── Reusable product select ────────────────────────────────────
// Always included with every product query for consistency
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

// ── Helper: build orderBy from sortBy string ───────────────────
const buildOrderBy = (
  sortBy: SortBy = "newest"
): Prisma.ProductOrderByWithRelationInput => {
  const map: Record<SortBy, Prisma.ProductOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    price_asc: { discountPrice: "asc" },
    price_desc: { discountPrice: "desc" },
    rating: { rating: "desc" },
  };
  return map[sortBy];
};

// ── Filter params type ─────────────────────────────────────────
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sortBy?: SortBy;
  page: number;
  limit: number;
  skip: number;
}

// ── Build Prisma where clause from filters ─────────────────────
// Returns a ProductWhereInput — only active products always applied
const buildWhereClause = (
  filters: Omit<ProductFilters, "sortBy" | "page" | "limit" | "skip">
): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {
    isActive: true, // Always filter: never return unpublished products
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  // Price range filter — both bounds are optional
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.discountPrice = {
      ...(filters.minPrice !== undefined && { gte: new Prisma.Decimal(filters.minPrice) }),
      ...(filters.maxPrice !== undefined && { lte: new Prisma.Decimal(filters.maxPrice) }),
    };
  }

  // Stock filter — stock > 0 means product is available
  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  // Rating filter — gte means "at least this rating"
  if (filters.minRating !== undefined) {
    where.rating = { gte: new Prisma.Decimal(filters.minRating) };
  }

  return where;
};

// ── Get paginated product list with filters ────────────────────
export const findProducts = async (filters: ProductFilters) => {
  const where = buildWhereClause(filters);
  const orderBy = buildOrderBy(filters.sortBy);

  // Parallel queries: fetch data and total count simultaneously
  // This halves DB round-trip time compared to sequential queries
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      orderBy,
      skip: filters.skip,
      take: filters.limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total };
};

// ── Get single product by ID ───────────────────────────────────
export const findProductById = async (id: string) => {
  return db.product.findFirst({
    where: { id, isActive: true }, // findFirst allows compound where easily
    select: productSelect,
  });
};

// ── Get single product by slug ─────────────────────────────────
export const findProductBySlug = async (slug: string) => {
  return db.product.findFirst({
    where: { slug, isActive: true },
    select: productSelect,
  });
};

// ── Search products by name / description / brand ─────────────
// Uses Prisma's `contains` + `mode: 'insensitive'` which maps to
// PostgreSQL's ILIKE operator: WHERE name ILIKE '%query%'
//
// For production scale, replace with:
//   - PostgreSQL full-text search (tsvector + GIN index)
//   - Or Elasticsearch / Typesense
export const searchProducts = async (
  q: string,
  _page: number,
  limit: number,
  skip: number
) => {
  // Build OR clause: match in name, description, OR brand
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ],
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      orderBy: { rating: "desc" }, // Search results sorted by rating by default
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total };
};

// ── Get products by category slug ─────────────────────────────
// Joins through the category relation to filter by slug
// This avoids needing a separate category lookup to get the ID first
export const findProductsByCategorySlug = async (
  slug: string,
  sortBy: SortBy = "newest",
  _page: number,
  limit: number,
  skip: number
) => {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    category: { slug }, // Prisma handles the JOIN automatically
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      orderBy: buildOrderBy(sortBy),
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total };
};
