/**
 * src/middlewares/validate.ts
 *
 * Generic Zod validation middleware factory.
 *
 * EXPRESS 5 NOTE:
 * ────────────────
 * In Express 5, `req.query` and `req.params` are read-only getters.
 * Attempting to reassign them throws: "Cannot set property query of #
 * which has only a getter".
 *
 * Solution: After validation, store the PARSED (coerced) values on
 * custom properties: `req.validatedQuery`, `req.validatedParams`, `req.body`.
 * - req.body is still writable in Express 5.
 * - Controllers read `req.validatedQuery` / `req.validatedParams` for
 *   access to type-coerced values.
 *
 * WHY not just use req.query directly in controllers?
 * ─────────────────────────────────────────────────────
 * req.query always gives ParsedQs (everything is string | string[] | undefined).
 * Our Zod schemas coerce "2" → 2 (number), "true" → true (boolean), etc.
 * Controllers need those coerced types — so we pass through the Zod output.
 */

import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

interface ValidateSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export const validate =
  (schema: ValidateSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        // Store validated params — Express 5 params getter is writable per-route
        const parsed = await schema.params.parseAsync(req.params);
        Object.assign(req.params, parsed);
      }

      if (schema.query) {
        // Store coerced query on a custom property (req.query is read-only in Express 5)
        const parsed = await schema.query.parseAsync(req.query);
        (req as Request & { validatedQuery: unknown }).validatedQuery = parsed;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          details: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };
