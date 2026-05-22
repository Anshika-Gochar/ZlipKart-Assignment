/**
 * src/modules/products/product.controller.ts
 *
 * HTTP layer for Product endpoints.
 *
 * Query access pattern (Express 5):
 * ────────────────────────────────────
 * After validate({ query: schema }) runs, the Zod-coerced query values
 * are stored on `req.validatedQuery` (not req.query, which is read-only in Express 5).
 * We cast it to the inferred type — safe because validate() already verified the shape.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as productService from "./product.service";
import {
  ProductListQuery,
  SearchQuery,
  CategoryProductsQuery,
} from "./product.schema";

// ── GET /api/v1/products ──────────────────────────────────────
export const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as ProductListQuery;
    const { products, total, page, limit } = await productService.getProducts(query);

    res.status(StatusCodes.OK).json(
      ApiResponse.paginated(products, total, page, limit, "Products fetched successfully")
    );
  }
);

// ── GET /api/v1/products/search?q= ───────────────────────────
// IMPORTANT: Registered before /:id in routes to avoid collision
export const searchProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as SearchQuery;
    const { products, total, page, limit } = await productService.searchForProducts(query);

    res.status(StatusCodes.OK).json(
      ApiResponse.paginated(
        products,
        total,
        page,
        limit,
        `Search results for "${query.q}"`
      )
    );
  }
);

// ── GET /api/v1/products/category/:slug ──────────────────────
export const getProductsByCategory = asyncHandler(
  async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const query = req.validatedQuery as CategoryProductsQuery;
    const { products, total, page, limit } =
      await productService.getProductsByCategory(req.params.slug, query);

    res.status(StatusCodes.OK).json(
      ApiResponse.paginated(
        products,
        total,
        page,
        limit,
        "Category products fetched successfully"
      )
    );
  }
);

// ── GET /api/v1/products/:id ──────────────────────────────────
export const getProductById = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const product = await productService.getProductById(req.params.id);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(product, "Product fetched successfully")
    );
  }
);
