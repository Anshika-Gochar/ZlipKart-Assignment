/**
 * src/config/constants.ts
 *
 * Application-wide constants.
 * Keeping magic numbers/strings here means changing them
 * in ONE place propagates everywhere automatically.
 */

// ── Pagination ────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ── Password ──────────────────────────────────────────────────
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
} as const;

// ── Product ───────────────────────────────────────────────────
export const PRODUCT = {
  MAX_IMAGES: 10,
  MIN_STOCK: 0,
} as const;

// ── Cart ──────────────────────────────────────────────────────
export const CART = {
  MAX_QUANTITY_PER_ITEM: 10,
  MAX_ITEMS: 50,
} as const;

// ── API Versioning ────────────────────────────────────────────
export const API = {
  VERSION: "v1",
  PREFIX: "/api/v1",
} as const;

// ── HTTP Headers ──────────────────────────────────────────────
export const HEADERS = {
  AUTHORIZATION: "Authorization",
  BEARER_PREFIX: "Bearer ",
} as const;
