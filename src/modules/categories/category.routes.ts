/**
 * src/modules/categories/category.routes.ts
 *
 * Category routes — all public (no authentication required).
 * Categories are part of the public product catalog.
 */

import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { slugParamSchema } from "./category.schema";
import * as categoryController from "./category.controller";

const router = Router();

// GET /api/v1/categories
router.get("/", categoryController.getAllCategories);

// GET /api/v1/categories/:slug
router.get(
  "/:slug",
  validate({ params: slugParamSchema }),
  categoryController.getCategoryBySlug
);

export default router;
