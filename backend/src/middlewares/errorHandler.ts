/**
 * src/middlewares/errorHandler.ts
 *
 * GLOBAL ERROR HANDLER — must be the LAST middleware registered in app.ts.
 *
 * Express identifies error-handling middleware by its 4-argument signature:
 *   (err, req, res, next) — the `err` as first param is the key
 *
 * HOW THE ERROR FLOW WORKS:
 * ──────────────────────────
 *
 *   1. Service throws:       throw new ApiError(404, "Product not found")
 *   2. asyncHandler catches: Promise.reject → calls next(err)
 *   3. Express routes err:   skips all regular middleware
 *   4. This handler runs:    formats and sends the JSON response
 *
 * WHY centralized?
 * ─────────────────
 * Without this, each controller would need its own try/catch and
 * would format errors differently. Centralization means:
 *   - One consistent error envelope for all 40+ endpoints
 *   - One place to add logging, Sentry reporting, etc.
 *   - No duplicated error-formatting logic
 *
 * OPERATIONAL vs. PROGRAMMING errors:
 * ────────────────────────────────────
 * - Operational (isOperational=true): expected business errors
 *   (404 not found, 401 unauthorized) — safe to show to client
 * - Programming (isOperational=false): bugs, DB down, etc.
 *   — log internally, show generic message to client
 */

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

// 4-param signature signals to Express this is an error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ── Log every error (structured) ─────────────────────────
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: env.isDev ? err.stack : undefined,
  });

  // ── Case 1: Our own ApiError (expected business error) ────
  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
    };
    if (err.details !== undefined) body.details = err.details;
    if (env.isDev) body.stack = err.stack;
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Case 2: Zod validation error ─────────────────────────
  // Zod throws ZodError when schema.parse() fails
  if (err instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // ── Case 3: Prisma known request error ───────────────────
  // e.g. unique constraint violation, record not found
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: "A record with this value already exists",
          field: (err.meta?.target as string[])?.join(", "),
        });
        return;

      case "P2025": // Record not found
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Record not found",
        });
        return;

      case "P2003": // Foreign key constraint failed
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Referenced record does not exist",
        });
        return;

      default:
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Database error occurred",
          ...(env.isDev && { code: err.code }),
        });
        return;
    }
  }

  // ── Case 4: JWT errors ────────────────────────────────────
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message:
        err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token",
    });
    return;
  }

  // ── Case 5: Unknown / programming error (catch-all) ──────
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: env.isProd ? "Internal server error" : err.message,
    ...(env.isDev && { stack: err.stack }),
  });
};
