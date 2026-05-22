/**
 * src/modules/wishlist/wishlist.controller.ts
 *
 * HTTP layer for Wishlist endpoints.
 * All routes are protected — req.user is guaranteed.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as wishlistService from "./wishlist.service";

// ── POST /api/v1/wishlist/:productId ──────────────────────────
export const addToWishlist = asyncHandler(
  async (req: Request<{ productId: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const wishlist = await wishlistService.addToWishlist(userId, productId);

    res.status(StatusCodes.CREATED).json(
      ApiResponse.success(wishlist, "Product added to wishlist")
    );
  }
);

// ── GET /api/v1/wishlist ──────────────────────────────────────
export const getWishlist = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const wishlist = await wishlistService.getWishlist(userId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(wishlist, "Wishlist fetched successfully")
    );
  }
);

// ── DELETE /api/v1/wishlist/:productId ────────────────────────
export const removeFromWishlist = asyncHandler(
  async (req: Request<{ productId: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const wishlist = await wishlistService.removeFromWishlist(userId, productId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(wishlist, "Product removed from wishlist")
    );
  }
);
