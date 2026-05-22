/**
 * src/utils/ApiResponse.ts
 *
 * Standardized HTTP response wrapper.
 *
 * WHY a response wrapper?
 * ────────────────────────
 * Without a standard envelope, different controllers return
 * different shapes:
 *   { user: ... }     ← controller A
 *   { data: ... }     ← controller B
 *   { result: ... }   ← controller C
 *
 * This makes the frontend brittle — it has to handle every shape.
 * A consistent envelope means the frontend ALWAYS knows:
 *   response.success  → boolean
 *   response.data     → the payload
 *   response.message  → human-readable status
 *   response.meta     → pagination info (if applicable)
 *
 * Usage in controllers:
 *   res.status(200).json(
 *     ApiResponse.success(product, "Product fetched")
 *   );
 */

import { PAGINATION } from "../config/constants";

// ── Pagination metadata shape ─────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Success response ──────────────────────────────────────────
export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;
  public readonly meta?: PaginationMeta;

  constructor(data: T, message: string, meta?: PaginationMeta) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  // ── Factory: simple success ───────────────────────────────

  static success<T>(
    data: T,
    message = "Success",
    meta?: PaginationMeta
  ): ApiResponse<T> {
    return new ApiResponse(data, message, meta);
  }

  // ── Factory: paginated list ───────────────────────────────

  static paginated<T>(
    data: T,
    total: number,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    message = "Data fetched successfully"
  ): ApiResponse<T> {
    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return new ApiResponse(data, message, meta);
  }
}
