/**
 * src/modules/orders/order.controller.ts
 *
 * HTTP layer for Order endpoints.
 * All routes are protected — req.user is guaranteed.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as orderService from "./order.service";
import { PlaceOrderInput, OrderListQuery } from "./order.schema";

// ── POST /api/v1/orders (checkout) ───────────────────────────
export const placeOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const input = req.body as PlaceOrderInput;

    const order = await orderService.placeOrder(userId, input);

    // 201 Created for new resources
    res.status(StatusCodes.CREATED).json(
      ApiResponse.success(order, "Order placed successfully")
    );
  }
);

// ── GET /api/v1/orders ────────────────────────────────────────
export const getOrderHistory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const query = req.validatedQuery as OrderListQuery;

    const { orders, total, page, limit } = await orderService.getOrderHistory(
      userId,
      query
    );

    res.status(StatusCodes.OK).json(
      ApiResponse.paginated(orders, total, page, limit, "Order history fetched successfully")
    );
  }
);

// ── GET /api/v1/orders/:id ────────────────────────────────────
export const getOrderDetail = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await orderService.getOrderDetail(userId, id);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(order, "Order fetched successfully")
    );
  }
);
