/**
 * src/types/express.d.ts
 *
 * Augments Express's Request interface to add a `user` property.
 *
 * WHY this matters:
 * ──────────────────
 * The `authenticate` middleware decodes the JWT and attaches the
 * user payload to `req.user`. Without this augmentation, TypeScript
 * doesn't know `req.user` exists and will throw a type error on
 * every controller that accesses it.
 *
 * This is a standard TypeScript "declaration merging" technique —
 * we extend the existing Express namespace without touching its
 * source code.
 *
 * After this file, anywhere in the codebase:
 *   req.user.userId   ← fully typed, no casting needed
 */

import { JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      // Coerced + validated query params (set by validate middleware)
      // req.query is read-only in Express 5, so parsed values go here
      validatedQuery?: unknown;
    }
  }
}
