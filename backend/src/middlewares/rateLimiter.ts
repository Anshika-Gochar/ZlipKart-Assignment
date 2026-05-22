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
  standardHeaders: true,
  legacyHeaders: false,
  // In development, skip rate limiting entirely to prevent lockouts during testing
  skip: () => env.isDev,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

// ── Auth limiter — stricter limits for login/register ─────────
// In production: 10 attempts per 15 minutes (strict brute-force protection)
// In development: 200 attempts per 15 minutes (prevents lockout during testing)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isDev ? 200 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
