/**
 * src/config/db.ts
 *
 * Prisma Client Singleton
 *
 * WHY a singleton?
 * ─────────────────
 * Prisma opens a connection pool to PostgreSQL when instantiated.
 * If you do `new PrismaClient()` in every file, each import creates
 * a NEW connection pool — exhausting the database's max connections fast.
 *
 * The singleton pattern ensures ONE PrismaClient instance exists for
 * the entire lifetime of the Node.js process.
 *
 * HOW it integrates into the architecture:
 * ─────────────────────────────────────────
 * server.ts → app.ts → repository files → db.ts → PostgreSQL
 *
 * Every repository imports `db` from this file. No repository
 * creates its own client. This gives us:
 *  - Centralized connection management
 *  - Single point for connection pool configuration
 *  - Easy to swap with a test client in unit tests
 *
 * In development, ts-node-dev/tsx hot-reloads modules which can
 * create multiple instances. The globalThis trick prevents that.
 */

import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Extend globalThis to hold our singleton across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// In production: always create a fresh instance
// In development: reuse the global instance across hot-reloads
const db: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: env.isDev ? ["query", "error", "warn"] : ["error"],
    errorFormat: env.isDev ? "pretty" : "minimal",
  });

if (env.isDev) {
  globalThis.__prisma = db;
}

export default db;
