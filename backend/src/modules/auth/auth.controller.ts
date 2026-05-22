/**
 * src/modules/auth/auth.controller.ts
 *
 * HTTP Layer — Auth endpoints.
 *
 * Controller responsibilities (and ONLY these):
 *  ✓ Extract data from req (body, params, query, user)
 *  ✓ Call exactly ONE service method
 *  ✓ Send a standardized ApiResponse
 *  ✗ NO business logic (that's the service)
 *  ✗ NO Prisma queries (that's the repository)
 *  ✗ NO password hashing (that's the service)
 *
 * Every handler is wrapped in asyncHandler so any thrown
 * ApiError is automatically forwarded to the global errorHandler
 * without a try/catch in every function.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import { RegisterInput, LoginInput } from "./auth.schema";

// ── POST /api/v1/auth/register ────────────────────────────────
/**
 * Register a new user.
 * Body is already validated by the validate() middleware before
 * this controller runs — req.body is guaranteed to match RegisterInput.
 */
export const register = asyncHandler(
  async (req: Request<object, object, RegisterInput>, res: Response): Promise<void> => {
    const { user, accessToken } = await authService.register(req.body);

    res.status(StatusCodes.CREATED).json(
      ApiResponse.success(
        { user, accessToken },
        "Account created successfully"
      )
    );
  }
);

// ── POST /api/v1/auth/login ───────────────────────────────────
/**
 * Authenticate user and return access token.
 */
export const login = asyncHandler(
  async (req: Request<object, object, LoginInput>, res: Response): Promise<void> => {
    const { user, accessToken } = await authService.login(req.body);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(
        { user, accessToken },
        "Login successful"
      )
    );
  }
);

// ── GET /api/v1/auth/me ───────────────────────────────────────
/**
 * Get current authenticated user's profile.
 *
 * req.user is populated by the authenticate middleware:
 *   authenticate → verifyAccessToken(token) → req.user = { userId, email, role }
 *
 * We fetch FRESH data from DB (not just from the token) because:
 *  - User may have updated their name/phone after the token was issued
 *  - User may have been deactivated — the token would still be "valid"
 *  - Token only stores userId/email/role — not full profile data
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // req.user is guaranteed here because authenticate middleware runs first
    const userId = req.user!.userId;

    const user = await authService.getCurrentUser(userId);

    res.status(StatusCodes.OK).json(
      ApiResponse.success(user, "User profile fetched successfully")
    );
  }
);
