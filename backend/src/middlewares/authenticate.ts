/**
 * src/middlewares/authenticate.ts
 *
 * JWT Authentication Middleware.
 *
 * Extracts the Bearer token from Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 *
 * Routes that require authentication use this middleware:
 *   router.get('/cart', authenticate, cartController.getCart);
 *
 * Routes that are public skip this middleware entirely.
 *
 * HOW IT WORKS:
 * ─────────────
 *   Authorization: Bearer <token>
 *         ↓
 *   Extract token string
 *         ↓
 *   verifyAccessToken(token) → JwtPayload
 *         ↓
 *   req.user = { userId, email, role }
 *         ↓
 *   next() → controller runs with req.user available
 */

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { HEADERS } from "../config/constants";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(HEADERS.BEARER_PREFIX)) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.slice(HEADERS.BEARER_PREFIX.length);

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    // Verify and decode the token — throws ApiError if invalid
    const payload = verifyAccessToken(token);

    // Attach decoded user to request (typed via express.d.ts)
    req.user = payload;

    next();
  } catch (err) {
    next(err);
  }
};

// ── Optional auth: attaches user if token present, continues either way ──
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith(HEADERS.BEARER_PREFIX)) {
      const token = authHeader.slice(HEADERS.BEARER_PREFIX.length);
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Token invalid — treat as unauthenticated, don't throw
  }
  next();
};
