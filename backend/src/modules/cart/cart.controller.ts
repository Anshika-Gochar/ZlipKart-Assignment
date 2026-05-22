/**
 * src/modules/cart/cart.controller.ts
 *
 * HTTP layer for Cart endpoints.
 * All handlers: extract data → call one service method → send response.
 * req.user is guaranteed by the authenticate middleware on every route.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as cartService from "./cart.service";
import { AddItemInput, UpdateQuantityInput } from "./cart.schema";

// ── POST /api/v1/cart/items ───────────────────────────────────
export const addToCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const input = req.body as AddItemInput;

    const cart = await cartService.addToCart(userId, input);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(cart, "Item added to cart successfully")
    );
  }
);

// ── GET /api/v1/cart ──────────────────────────────────────────
export const getCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await cartService.getCart(userId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(cart, "Cart fetched successfully")
    );
  }
);

// ── PATCH /api/v1/cart/items/:itemId ─────────────────────────
export const updateItemQuantity = asyncHandler(
  async (req: Request<{ itemId: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId } = req.params;
    const input = req.body as UpdateQuantityInput;

    const cart = await cartService.updateItemQuantity(userId, itemId, input);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(cart, "Cart item updated successfully")
    );
  }
);

// ── DELETE /api/v1/cart/items/:itemId ─────────────────────────
export const removeItem = asyncHandler(
  async (req: Request<{ itemId: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cart = await cartService.removeItem(userId, itemId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(cart, "Item removed from cart successfully")
    );
  }
);

// ── DELETE /api/v1/cart/clear ─────────────────────────────────
export const clearCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await cartService.clearCart(userId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(cart, "Cart cleared successfully")
    );
  }
);
