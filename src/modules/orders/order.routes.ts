/**
 * src/modules/orders/order.routes.ts
 *
 * All order routes are protected — authenticate runs at router level.
 *
 * Route registration order:
 *   GET  /        ← history list
 *   POST /        ← place order (checkout)
 *   GET  /:id     ← order detail (LAST — param route)
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  placeOrderSchema,
  orderListQuerySchema,
  orderIdParamSchema,
} from "./order.schema";
import * as orderController from "./order.controller";

const router = Router();

// Apply authentication to ALL order routes
router.use(authenticate);

// ── POST /api/v1/orders (checkout) ───────────────────────────
router.post(
  "/",
  validate({ body: placeOrderSchema }),
  orderController.placeOrder
);

// ── GET /api/v1/orders ────────────────────────────────────────
router.get(
  "/",
  validate({ query: orderListQuerySchema }),
  orderController.getOrderHistory
);

// ── GET /api/v1/orders/:id ────────────────────────────────────
router.get(
  "/:id",
  validate({ params: orderIdParamSchema }),
  orderController.getOrderDetail
);

export default router;
