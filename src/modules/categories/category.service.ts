/**
 * src/modules/categories/category.service.ts
 *
 * Business logic for Category endpoints.
 * Categories are read-only for public users in this implementation.
 */

import { ApiError } from "../../utils/ApiError";
import {
  findAllCategories,
  findCategoryBySlug,
} from "./category.repository";

// ── Get all root categories (with children) ───────────────────
export const getAllCategories = async () => {
  const categories = await findAllCategories();
  return categories;
};

// ── Get single category by slug ───────────────────────────────
export const getCategoryBySlug = async (slug: string) => {
  const category = await findCategoryBySlug(slug);

  if (!category) {
    throw ApiError.notFound(`Category '${slug}'`);
  }

  return category;
};
