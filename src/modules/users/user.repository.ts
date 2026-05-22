/**
 * src/modules/users/user.repository.ts
 *
 * Data access layer for the User entity.
 *
 * RULES for this layer:
 * ──────────────────────
 * 1. ONLY Prisma calls live here — no business logic
 * 2. No HTTP concerns (no req/res, no ApiError for business rules)
 * 3. Every function accepts plain data types, returns plain data
 * 4. The service layer decides WHAT to do; this layer does the DB work
 *
 * WHY a separate repository instead of calling Prisma directly in the service?
 * ─────────────────────────────────────────────────────────────────────────────
 * - Testability: swap real DB with a mock in unit tests
 * - Single responsibility: service focuses on logic, repo focuses on queries
 * - Reusability: multiple services can call the same repository function
 * - Maintainability: if Prisma API changes, only repo files need updating
 */

import db from "../../config/db";
import { Prisma } from "@prisma/client";

// ── Type: Safe user (password excluded) ───────────────────────
// Prisma's type system lets us define exactly which fields to return.
// This type is used throughout the codebase wherever a "safe" user is needed.
export type SafeUser = Omit<
  Prisma.UserGetPayload<Record<string, never>>,
  "passwordHash"
>;

// ── Reusable select object — NEVER includes passwordHash ───────
// Defined once here so we don't scatter { select: { passwordHash: false } }
// across every query. Changing password field name = one place to update.
const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ── Find user by email (includes passwordHash for login comparison) ──
// This is the ONE place where we intentionally fetch the hash.
// It's used only by auth.service.ts for credential verification.
export const findUserByEmail = async (email: string) => {
  return db.user.findUnique({
    where: { email },
    // No select restriction: we need passwordHash for comparison
  });
};

// ── Find user by ID (safe — no password) ──────────────────────
export const findUserById = async (id: string): Promise<SafeUser | null> => {
  return db.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
};

// ── Create a new user ─────────────────────────────────────────
// Returns the safe user (no passwordHash) immediately after creation.
export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}): Promise<SafeUser> => {
  return db.user.create({
    data,
    select: safeUserSelect, // Never return the hash we just stored
  });
};

// ── Check if email already exists (for duplicate check) ───────
// More efficient than findUserByEmail for existence checks —
// SELECT COUNT(*) is cheaper than SELECT * when we only need a boolean.
export const emailExists = async (email: string): Promise<boolean> => {
  const count = await db.user.count({
    where: { email },
  });
  return count > 0;
};
