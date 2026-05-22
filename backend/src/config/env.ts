/**
 * src/config/env.ts
 *
 * Validates and exports all environment variables at startup.
 * If any required variable is missing, the app crashes with a
 * clear error message — "fail fast" principle.
 *
 * Why centralize env vars?
 * - Single source of truth: no process.env scattered across files
 * - Type-safe: all vars are typed strings/numbers, not `string | undefined`
 * - Validation at startup: catches misconfiguration before a request hits a broken path
 */

import dotenv from "dotenv";
import { z } from "zod";

// Load .env file into process.env before validation
dotenv.config();

// ── Schema: defines the shape and types of all env vars ──────
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("5000"),
  API_VERSION: z.string().default("v1"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, "JWT_REFRESH_SECRET must be at least 10 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX: z.string().default("100"),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: z.string().default("12"),
});

// ── Parse & validate — throws ZodError on failure ─────────────
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1); // Crash immediately — no point running with bad config
}

// ── Export typed, validated config object ─────────────────────
export const env = {
  nodeEnv: _parsed.data.NODE_ENV,
  port: parseInt(_parsed.data.PORT, 10),
  apiVersion: _parsed.data.API_VERSION,
  isDev: _parsed.data.NODE_ENV === "development",
  isProd: _parsed.data.NODE_ENV === "production",

  databaseUrl: _parsed.data.DATABASE_URL,

  jwt: {
    secret: _parsed.data.JWT_SECRET,
    expiresIn: _parsed.data.JWT_EXPIRES_IN,
    refreshSecret: _parsed.data.JWT_REFRESH_SECRET,
    refreshExpiresIn: _parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    origin: _parsed.data.CORS_ORIGIN,
  },

  rateLimit: {
    windowMs: parseInt(_parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(_parsed.data.RATE_LIMIT_MAX, 10),
  },

  bcrypt: {
    saltRounds: parseInt(_parsed.data.BCRYPT_SALT_ROUNDS, 10),
  },
} as const;
