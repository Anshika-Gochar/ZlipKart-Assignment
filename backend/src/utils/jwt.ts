/**
 * src/utils/jwt.ts
 *
 * JWT utility helpers: sign and verify tokens.
 * Centralizing these prevents token config drift —
 * all JWT operations use the same secret and options.
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./ApiError";
import { StatusCodes } from "http-status-codes";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// ── Sign an access token ──────────────────────────────────────
export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

// ── Sign a refresh token ──────────────────────────────────────
export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

// ── Verify an access token ────────────────────────────────────
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.secret) as JwtPayload;
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};

// ── Verify a refresh token ────────────────────────────────────
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
  }
};
