/**
 * src/modules/addresses/address.controller.ts
 *
 * HTTP layer for Address endpoints.
 * All routes are protected — req.user is guaranteed.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as addressService from "./address.service";
import { CreateAddressInput, UpdateAddressInput } from "./address.schema";

// ── POST /api/v1/addresses ────────────────────────────────────
export const createAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const input = req.body as CreateAddressInput;

    const address = await addressService.createAddressForUser(userId, input);

    res.status(StatusCodes.CREATED).json(
      ApiResponse.success(address, "Address added successfully")
    );
  }
);

// ── GET /api/v1/addresses ─────────────────────────────────────
export const getAddresses = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const addresses = await addressService.getAddresses(userId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(addresses, "Addresses fetched successfully")
    );
  }
);

// ── PATCH /api/v1/addresses/:id ───────────────────────────────
export const updateAddress = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const input = req.body as UpdateAddressInput;

    const address = await addressService.updateAddressForUser(userId, id, input);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(address, "Address updated successfully")
    );
  }
);

// ── DELETE /api/v1/addresses/:id ──────────────────────────────
export const deleteAddress = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await addressService.deleteAddressForUser(userId, id);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(null, "Address deleted successfully")
    );
  }
);

// ── PATCH /api/v1/addresses/:id/default ───────────────────────
export const setDefaultAddress = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const address = await addressService.setDefaultAddress(userId, id);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(address, "Default address updated successfully")
    );
  }
);
