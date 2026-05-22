/**
 * src/middlewares/rateLimiter.ts
 *
 * Rate limiting middleware to protect against brute-force attacks
 * and API abuse. Applied at different granularities:
 *
 *  - globalLimiter: all API routes (broad protection)
 *  - authLimiter:   auth routes only (strict — prevents credential stuffing)
 *
 * Configuration comes from env.ts — adjustable without code changes.
 */

import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { StatusCodes } from "http-status-codes";

// ── Global rate limiter — applied to all /api/* routes ────────
export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,  // default: 15 minutes
  max: env.rateLimit.max,            // default: 100 requests per window
  standardHeaders: true,             // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

// ── Auth limiter — stricter limits for login/register ─────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window (strict)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
