/**
 * src/modules/ai/ai.routes.ts
 *
 * Routes for the AI shopping assistant module.
 *
 * POST /api/v1/ai/recommend
 *   Accepts: { query: string }
 *   Returns: { message: string, products: Product[] }
 *
 * Validation via Zod: query must be a non-empty string ≤ 200 chars.
 * No authentication required — the assistant is fully public.
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate";
import * as aiController from "./ai.controller";

const router = Router();

// ── Zod schema for the request body ───────────────────────────
const recommendBodySchema = z.object({
  query: z
    .string({ required_error: "query is required" })
    .min(1, "Query cannot be empty")
    .max(200, "Query must be 200 characters or fewer")
    .trim(),
});

// ── POST /api/v1/ai/recommend ──────────────────────────────────
router.post(
  "/recommend",
  validate({ body: recommendBodySchema }),
  aiController.recommend
);

export default router;
