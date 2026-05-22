/**
 * src/middlewares/notFound.ts
 *
 * 404 fallback middleware — catches any request that didn't
 * match a registered route and forwards an ApiError to the
 * global error handler.
 *
 * Registered AFTER all route mounts but BEFORE errorHandler.
 *
 * Middleware order in app.ts:
 *   app.use(routes)        ← tries to match
 *   app.use(notFound)      ← fires if no route matched
 *   app.use(errorHandler)  ← handles all errors including 404
 */

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};
