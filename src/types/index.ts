/**
 * src/types/index.ts
 *
 * Shared TypeScript types and interfaces reused across modules.
 * Keeps type definitions DRY — define once, import everywhere.
 */

// ── Generic ID param type for route handlers ─────────────────
export interface IdParam {
  id: string;
}

// ── Query params for list endpoints ──────────────────────────
export interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Product list query (extends base with filters) ───────────
export interface ProductListQuery extends ListQuery {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}
