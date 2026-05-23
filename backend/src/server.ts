/**
 * src/server.ts
 *
 * HTTP Server Entry Point
 *
 * Responsibilities:
 *  1. Create the Express app via factory function
 *  2. Start the HTTP server on the configured port
 *  3. Handle graceful shutdown (SIGTERM / SIGINT)
 *  4. Handle uncaught exceptions and unhandled rejections
 *
 * WHY separate from app.ts?
 * ──────────────────────────
 * - app.ts can be imported in tests without binding to a port
 * - Graceful shutdown logic lives here, not in app.ts
 * - Separation of concerns: app = middleware config, server = process lifecycle
 *
 * GRACEFUL SHUTDOWN:
 * ──────────────────
 * When Kubernetes/Docker sends SIGTERM before killing the process:
 *  1. Stop accepting new connections (server.close)
 *  2. Finish processing in-flight requests
 *  3. Close the Prisma connection pool (db.$disconnect)
 *  4. Exit cleanly
 *
 * Without graceful shutdown, killing the process mid-request
 * can corrupt in-flight database transactions.
 */

import { createApp } from "./app";
import { env } from "./config/env";
import db from "./config/db";

const app = createApp();

// ── Start HTTP server ─────────────────────────────────────────
const server = app.listen(env.port, () => {
  console.log(`
╔═════════════════════════════════════════════╗
║            ZlipKart API Server              ║
╠═════════════════════════════════════════════╣
║  Status    : Running ✓                      ║
║  Port      : ${env.port}                           ║
║  Env       : ${env.nodeEnv.padEnd(15)}             ║
║  API       : http://localhost:${env.port}/api/${env.apiVersion}  ║
║  Health    : http://localhost:${env.port}/api/${env.apiVersion}/health ║
╚═════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ─────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n⚡ ${signal} received — starting graceful shutdown...`);

  // Stop accepting new requests
  server.close(async () => {
    console.log("✓ HTTP server closed");

    // Disconnect Prisma connection pool
    await db.$disconnect();
    console.log("✓ Database connections closed");

    console.log("✓ Graceful shutdown complete");
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("✗ Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

// Docker/Kubernetes sends SIGTERM for planned shutdowns
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Ctrl+C in terminal
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Safety nets for programming errors ───────────────────────

// Thrown errors not caught by any catch block
process.on("uncaughtException", (err: Error) => {
  console.error("💥 Uncaught Exception:", err.message);
  console.error(err.stack);
  // Crash immediately — process is in unknown state
  process.exit(1);
});

// Promise rejections not caught by .catch() or try/catch
process.on("unhandledRejection", (reason: unknown) => {
  console.error("💥 Unhandled Promise Rejection:", reason);
  // Don't crash immediately — allow in-flight requests to finish
  // but signal the health check that something is wrong
  shutdown("unhandledRejection").catch(() => process.exit(1));
});

export default server;
