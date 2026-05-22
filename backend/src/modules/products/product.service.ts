/**
 * src/modules/products/product.service.ts
 *
 * Business logic layer for Product endpoints.
 *
 * Responsibilities:
 *  ✓ Convert validated query types to repository params
 *  ✓ Enforce business rules (e.g. minPrice ≤ maxPrice)
 *  ✓ Throw ApiError for domain violations
 *  ✓ Compute pagination skip/take from page/limit
 *  ✗ No Prisma calls (repository handles those)
 *  ✗ No req/res (controller handles those)
 */

import { ApiError } from "../../utils/ApiError";
import {
  findProducts,
  findProductById,
  searchProducts,
  findProductsByCategorySlug,
  findSimilarProducts,
} from "./product.repository";
import { ProductListQuery, SearchQuery, CategoryProductsQuery } from "./product.schema";


// ── Get paginated product list ────────────────────────────────
export const getProducts = async (query: ProductListQuery) => {
  // Business rule: minPrice must not exceed maxPrice
  if (
    query.minPrice !== undefined &&
    query.maxPrice !== undefined &&
    query.minPrice > query.maxPrice
  ) {
    throw ApiError.badRequest("minPrice cannot be greater than maxPrice");
  }

  const skip = (query.page - 1) * query.limit;

  const { products, total } = await findProducts({
    categoryId: query.categoryId,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    inStock: query.inStock,
    minRating: query.minRating,
    sortBy: query.sortBy,
    page: query.page,
    limit: query.limit,
    skip,
  });

  return { products, total, page: query.page, limit: query.limit };
};

// ── Get single product by ID ──────────────────────────────────
export const getProductById = async (id: string) => {
  const product = await findProductById(id);

  if (!product) {
    throw ApiError.notFound("Product");
  }

  return product;
};

// ── Search products ───────────────────────────────────────────
export const searchForProducts = async (query: SearchQuery) => {
  const skip = (query.page - 1) * query.limit;

  const { products, total } = await searchProducts(
    query.q,
    query.page,
    query.limit,
    skip
  );

  return { products, total, page: query.page, limit: query.limit };
};

// ── Get products by category slug ─────────────────────────────
export const getProductsByCategory = async (
  slug: string,
  query: CategoryProductsQuery
) => {
  const skip = (query.page - 1) * query.limit;

  const { products, total } = await findProductsByCategorySlug(
    slug,
    query.sortBy,
    query.page,
    query.limit,
    skip
  );

  // Return empty array (not 404) if category exists but has no products
  return { products, total, page: query.page, limit: query.limit };
};

// ── Get similar products by product ID ─────────────────────
// 1. Fetch the source product (reuses existing service to share 404 handling)
// 2. Use its categoryId + discountPrice to find related products
export const getSimilarProducts = async (productId: string) => {
  // Reuse existing findProductById (already enforces isActive)
  const product = await findProductById(productId);

  if (!product) {
    throw ApiError.notFound("Product");
  }

  // discountPrice from Prisma is a Decimal — convert to plain number for arithmetic
  const discountPrice = Number(product.discountPrice);

  const similar = await findSimilarProducts(
    productId,
    product.categoryId,
    discountPrice
  );

  return similar;
};
