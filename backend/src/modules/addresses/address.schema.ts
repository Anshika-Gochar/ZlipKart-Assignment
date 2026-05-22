/**
 * src/modules/addresses/address.schema.ts
 *
 * Zod schemas for Address endpoints.
 * Field names match the Prisma Address model exactly:
 *   fullName, phone, street, city, state, pincode, landmark, isDefault
 */

import { z } from "zod";

// ── Indian phone regex (reused from auth) ──────────────────────
const indianPhone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit mobile number");

// ── Pincode regex ──────────────────────────────────────────────
const indianPincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Pincode must be exactly 6 digits");

// ── Create address ─────────────────────────────────────────────
export const createAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),

  phone: indianPhone,

  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address is too long"),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State name is too long"),

  pincode: indianPincode,

  landmark: z
    .string()
    .trim()
    .max(200, "Landmark is too long")
    .optional(),

  isDefault: z.boolean().optional().default(false),
});

// ── Update address — all fields optional (partial update) ─────
export const updateAddressSchema = createAddressSchema.partial();

// ── Route param: address ID ────────────────────────────────────
export const addressIdParamSchema = z.object({
  id: z.string().uuid("Address ID must be a valid UUID"),
});

// ── Inferred types ─────────────────────────────────────────────
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
