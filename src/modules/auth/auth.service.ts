/**
 * src/modules/auth/auth.service.ts
 *
 * Authentication Business Logic Layer.
 *
 * This layer:
 *  ✓ Enforces business rules (no duplicate emails, valid credentials)
 *  ✓ Handles password hashing and comparison
 *  ✓ Generates JWT tokens
 *  ✓ Throws ApiError for domain violations
 *  ✗ Does NOT touch req/res (that's the controller's job)
 *  ✗ Does NOT write Prisma queries (that's the repository's job)
 *
 * WHY is password hashing here (service) and not in the controller?
 * ───────────────────────────────────────────────────────────────────
 * Hashing is BUSINESS LOGIC — it's a rule about how passwords must be
 * stored. The controller just passes data through. If you later add
 * "also send a welcome email after registration", it belongs here too.
 */

import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken, JwtPayload } from "../../utils/jwt";
import { env } from "../../config/env";
import {
  createUser,
  emailExists,
  findUserByEmail,
  findUserById,
  SafeUser,
} from "../users/user.repository";
import { RegisterInput, LoginInput } from "./auth.schema";

// ── Return shape for auth endpoints ───────────────────────────
// Controller will wrap this in ApiResponse.success()
export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

// ── REGISTER ──────────────────────────────────────────────────
/**
 * Register a new user account.
 *
 * Flow:
 *  1. Check email is not already taken
 *  2. Hash password with bcrypt (cost factor from env)
 *  3. Persist user to DB (passwordHash stored, never raw password)
 *  4. Build JWT payload and sign access token
 *  5. Return safe user + token
 *
 * WHY hash the password?
 * ────────────────────────
 * If the database is ever compromised, attackers get the hash —
 * not the real password. bcrypt's cost factor (default 12) makes
 * brute-forcing hashes computationally infeasible.
 * Even if two users have the same password, bcrypt's salt makes
 * their hashes completely different — no rainbow table attacks.
 */
export const register = async (input: RegisterInput): Promise<AuthResult> => {
  // ── Step 1: Duplicate email check ─────────────────────────
  const alreadyExists = await emailExists(input.email);
  if (alreadyExists) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "An account with this email already exists"
    );
  }

  // ── Step 2: Hash password ──────────────────────────────────
  // bcrypt.hash() generates a unique random salt automatically.
  // Cost factor 12 = ~250ms per hash — fast enough for UX, too slow for brute-force.
  const passwordHash = await bcrypt.hash(input.password, env.bcrypt.saltRounds);

  // ── Step 3: Create user in DB ─────────────────────────────
  // Repository returns SafeUser (passwordHash excluded at DB query level)
  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone,
  });

  // ── Step 4: Generate JWT ───────────────────────────────────
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);

  return { user, accessToken };
};

// ── LOGIN ─────────────────────────────────────────────────────
/**
 * Authenticate an existing user with email + password.
 *
 * Flow:
 *  1. Look up user by email (fetches passwordHash — only time we need it)
 *  2. If not found → generic error (don't reveal whether email exists)
 *  3. Compare provided password against stored hash via bcrypt.compare()
 *  4. If mismatch → same generic error (timing-safe comparison)
 *  5. Check user account is active
 *  6. Sign and return access token + safe user
 *
 * Security note — Generic error message:
 * ────────────────────────────────────────
 * We say "Invalid email or password" — NOT "Email not found" or "Wrong password".
 * Revealing which field is wrong helps attackers enumerate valid emails.
 * This is called "credential stuffing protection".
 */
export const login = async (input: LoginInput): Promise<AuthResult> => {
  // ── Step 1: Find user by email (includes hash) ────────────
  const user = await findUserByEmail(input.email);

  // ── Step 2: User not found ────────────────────────────────
  // Generic message — don't reveal whether the email exists
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // ── Step 3: Compare password to stored hash ───────────────
  // bcrypt.compare() is timing-safe — takes the same time whether
  // hash matches or not, preventing timing-based enumeration attacks
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  // ── Step 4: Password mismatch ─────────────────────────────
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // ── Step 5: Account active check ──────────────────────────
  if (!user.isActive) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Your account has been deactivated. Please contact support."
    );
  }

  // ── Step 6: Build safe user (strip hash before returning) ─
  // Destructure out the passwordHash — controller must never see it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _hash, ...safeUser } = user;

  // ── Step 7: Sign JWT ──────────────────────────────────────
  const payload: JwtPayload = {
    userId: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  };
  const accessToken = signAccessToken(payload);

  return { user: safeUser as SafeUser, accessToken };
};

// ── GET CURRENT USER ──────────────────────────────────────────
/**
 * Fetch the authenticated user's profile.
 *
 * The authenticate middleware already verified the JWT and attached
 * req.user = { userId, email, role } to the request.
 * This function uses the userId to fetch fresh data from DB —
 * not from the token (tokens can be stale if user data changed).
 */
export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await findUserById(userId);

  if (!user) {
    // Token is valid but user was deleted after token was issued
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User no longer exists");
  }

  return user;
};
