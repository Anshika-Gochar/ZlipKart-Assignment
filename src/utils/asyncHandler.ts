/**
 * src/utils/asyncHandler.ts
 *
 * Wraps async Express route handlers to forward errors to
 * the global error handler via next(err).
 *
 * WHY does this exist?
 * ─────────────────────
 * Express 4 does NOT catch async errors automatically.
 * Without this wrapper, an unhandled rejection in a route
 * handler causes the server to hang (no response sent).
 *
 * ❌ Without asyncHandler — verbose and error-prone:
 * ─────────────────────────────────────────────────────
 *   async (req, res, next) => {
 *     try {
 *       const data = await someService();
 *       res.json(data);
 *     } catch (err) {
 *       next(err);   // ← must remember this in EVERY controller
 *     }
 *   }
 *
 * ✅ With asyncHandler — clean and safe:
 * ─────────────────────────────────────
 *   asyncHandler(async (req, res) => {
 *     const data = await someService();
 *     res.json(data);
 *   });
 *   // Any thrown error is automatically forwarded to next()
 *
 * NOTE: Express 5 handles async errors natively. If you upgrade
 * to Express 5, this wrapper is no longer strictly needed but
 * doesn't hurt to keep for backwards compatibility.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

// Accepts any Params shape so controllers can type req.params specifically
type AsyncRequestHandler<P = Record<string, string>> = (
  req: Request<P>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  <P = Record<string, string>>(fn: AsyncRequestHandler<P>): RequestHandler<P> =>
  (req: Request<P>, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
