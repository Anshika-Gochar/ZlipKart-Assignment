/**
 * src/modules/auth/auth.routes.ts
 *
 * Auth route definitions with middleware chains.
 *
 * Middleware chain execution order per route:
 *
 *   POST /register:
 *     authLimiter   → Strict rate limit (10 req/15min) — prevents registration spam
 *     validate()    → Validates body against registerSchema — rejects bad data
 *     register      → Controller executes
 *
 *   POST /login:
 *     authLimiter   → Strict rate limit — prevents brute-force attacks
 *     validate()    → Validates email format + password presence
 *     login         → Controller executes
 *
 *   GET /me:
 *     authenticate  → Verifies JWT, populates req.user — 401 if missing/invalid
 *     getMe         → Controller fetches fresh user from DB
 *
 * WHY middleware-based auth?
 * ──────────────────────────
 * Without middleware, every protected controller would need:
 *   const token = req.headers.authorization?.split(' ')[1];
 *   const user = verifyToken(token); // repeated in 30+ handlers
 *
 * With authenticate middleware:
 *   router.get('/me', authenticate, getMe)
 *   // req.user is guaranteed in getMe — clean, DRY, impossible to forget
 *
 * WHY is authenticate separate from authorize?
 * ─────────────────────────────────────────────
 * Authentication = "Who are you?" (verified by JWT)
 * Authorization  = "What are you allowed to do?" (checked by role)
 *
 * These are separate concerns. An ADMIN and USER are both authenticated
 * but have different permissions. Separating them lets us compose:
 *   router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser)
 */

import { Router } from "express";
import { authLimiter } from "../../middlewares/rateLimiter";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { registerSchema, loginSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

// ── POST /api/v1/auth/register ────────────────────────────────
router.post(
  "/register",
  authLimiter,                              // 10 requests / 15 minutes
  validate({ body: registerSchema }),       // Validate name, email, password
  authController.register                  // Create user + return token
);

// ── POST /api/v1/auth/login ───────────────────────────────────
router.post(
  "/login",
  authLimiter,                              // 10 requests / 15 minutes
  validate({ body: loginSchema }),          // Validate email format + password presence
  authController.login                     // Verify credentials + return token
);

// ── GET /api/v1/auth/me ───────────────────────────────────────
router.get(
  "/me",
  authenticate,                            // Verify JWT → attach req.user
  authController.getMe                    // Return fresh user profile from DB
);

export default router;
