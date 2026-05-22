/**
 * src/modules/auth/auth.schema.ts
 *
 * Zod v4 validation schemas for all auth endpoints.
 *
 * NOTE: Zod v4 replaced `required_error` with `error` in the
 * params object. `z.string()` without `.optional()` already
 * handles the required check — the `error` param customizes
 * the message when the field is missing or wrong type.
 */

import { z } from "zod";
import { PASSWORD } from "../../config/constants";

// ── Register Schema ────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
    .max(PASSWORD.MAX_LENGTH, `Password must be at most ${PASSWORD.MAX_LENGTH} characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian mobile number")
    .optional(),
});

// ── Login Schema ───────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

// ── Infer TypeScript types from schemas ───────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
