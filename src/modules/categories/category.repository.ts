/**
 * src/modules/categories/category.repository.ts
 *
 * Data access layer for Category entity.
 *
 * Design decisions:
 * ──────────────────
 * - GET /categories returns ONLY root categories (parentId: null)
 *   with their immediate children included via Prisma `include`.
 *   This gives the frontend enough data to render a navbar/sidebar
 *   without N+1 queries.
 *
 * - GET /categories/:slug returns the category + its immediate
 *   children + parent (for breadcrumb rendering).
 *
 * - We use `include` (eager load) rather than separate queries
 *   because the data is hierarchical and always needed together.
 */

import db from "../../config/db";

// ── Reusable select for a category (without heavy relations) ──
const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
};

// ── Get all root-level categories with their children ─────────
// Root = categories where parentId IS NULL (top-level: Electronics, Fashion, etc.)
export const findAllCategories = async () => {
  return db.category.findMany({
    where: { parentId: null },     // Only top-level categories
    select: {
      ...categorySelect,
      children: {                   // Eagerly load one level of children
        select: categorySelect,
        orderBy: { name: "asc" },
      },
      _count: {
        select: { products: true }, // How many products in this category
      },
    },
    orderBy: { name: "asc" },
  });
};

// ── Get single category by slug ───────────────────────────────
export const findCategoryBySlug = async (slug: string) => {
  return db.category.findUnique({
    where: { slug },
    select: {
      ...categorySelect,
      parent: { select: categorySelect },   // For breadcrumb
      children: { select: categorySelect, orderBy: { name: "asc" } },
      _count: { select: { products: true } },
    },
  });
};

// ── Get category by ID (internal use — used in product service) ──
export const findCategoryById = async (id: string) => {
  return db.category.findUnique({
    where: { id },
    select: categorySelect,
  });
};
