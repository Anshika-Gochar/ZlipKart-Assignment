/**
 * src/modules/categories/category.controller.ts
 *
 * HTTP layer for Category endpoints.
 * All handlers are thin: extract params → call service → send response.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as categoryService from "./category.service";

// ── GET /api/v1/categories ────────────────────────────────────
export const getAllCategories = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const categories = await categoryService.getAllCategories();

    res.status(StatusCodes.OK).json(
      ApiResponse.success(categories, "Categories fetched successfully")
    );
  }
);

// ── GET /api/v1/categories/:slug ──────────────────────────────
export const getCategoryBySlug = asyncHandler(
  async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(category, "Category fetched successfully")
    );
  }
);
