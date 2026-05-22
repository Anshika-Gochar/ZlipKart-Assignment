/**
 * src/modules/ai/ai.controller.ts
 *
 * HTTP layer for the AI shopping assistant endpoint.
 *
 * POST /api/v1/ai/recommend
 *   Body: { query: string }
 *   Response: { message: string, products: Product[] }
 *
 * Follows the exact same asyncHandler + ApiResponse.success
 * pattern as all other controllers in this codebase.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as aiService from "./ai.service";

// ── POST /api/v1/ai/recommend ──────────────────────────────────
export const recommend = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // req.body is validated by Zod before reaching here
    const { query } = req.body as { query: string };

    const result = await aiService.getAIRecommendations(query);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(result, "AI recommendations fetched successfully")
    );
  }
);
