/**
 * src/utils/pagination.ts
 *
 * Parses pagination query params from the request and returns
 * validated `skip` and `take` values for Prisma queries.
 *
 * Usage in a repository:
 *   const { skip, take, page, limit } = getPaginationParams(req.query);
 *   const products = await db.product.findMany({ skip, take });
 */

import { PAGINATION } from "../config/constants";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export const getPaginationParams = (query: {
  page?: string;
  limit?: string;
}): PaginationParams => {
  const page = Math.max(
    1,
    parseInt(query.page ?? String(PAGINATION.DEFAULT_PAGE), 10) || 1
  );

  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(
      1,
      parseInt(query.limit ?? String(PAGINATION.DEFAULT_LIMIT), 10) || 20
    )
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit, // Prisma `skip` value
    take: limit,              // Prisma `take` value
  };
};
