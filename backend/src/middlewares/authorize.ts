/**
 * src/middlewares/authorize.ts
 *
 * Role-Based Access Control (RBAC) middleware.
 * Used AFTER authenticate — requires req.user to be set.
 *
 * Usage:
 *   router.delete(
 *     '/products/:id',
 *     authenticate,
 *     authorize('ADMIN'),   ← only admins can delete products
 *     productController.delete
 *   );
 */

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized for this action`
        )
      );
    }

    next();
  };
