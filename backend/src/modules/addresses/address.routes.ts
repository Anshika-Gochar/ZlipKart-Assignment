/**
 * src/modules/addresses/address.routes.ts
 *
 * Address routes — all protected via router-level authenticate.
 *
 * ─────────────────────────────────────────────────────────────
 * CRITICAL route registration order:
 * ─────────────────────────────────────────────────────────────
 * PATCH /:id/default  ← registered BEFORE PATCH /:id
 *
 * Why? Express matches routes top-to-bottom.
 * If PATCH /:id were registered first, a request to:
 *   PATCH /addresses/some-uuid/default
 * Would match /:id with id="some-uuid/default" — which would
 * fail UUID validation and return 400.
 *
 * Registering /:id/default first lets Express distinguish
 * the two-segment path before falling to the single-segment /:id.
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from "./address.schema";
import * as addressController from "./address.controller";

const router = Router();

// All address routes require authentication
router.use(authenticate);

// ── GET /api/v1/addresses ─────────────────────────────────────
router.get("/", addressController.getAddresses);

// ── POST /api/v1/addresses ────────────────────────────────────
router.post(
  "/",
  validate({ body: createAddressSchema }),
  addressController.createAddress
);

// ── PATCH /api/v1/addresses/:id/default ───────────────────────
// MUST be before PATCH /:id — specific path first
router.patch(
  "/:id/default",
  validate({ params: addressIdParamSchema }),
  addressController.setDefaultAddress
);

// ── PATCH /api/v1/addresses/:id ───────────────────────────────
router.patch(
  "/:id",
  validate({ params: addressIdParamSchema, body: updateAddressSchema }),
  addressController.updateAddress
);

// ── DELETE /api/v1/addresses/:id ──────────────────────────────
router.delete(
  "/:id",
  validate({ params: addressIdParamSchema }),
  addressController.deleteAddress
);

export default router;
