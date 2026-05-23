/**
 * src/routes/health.routes.ts
 *
 * Health check endpoints.
 * Used by load balancers, Docker health checks, and uptime monitors
 * to verify the service is alive and the DB is reachable.
 *
 * GET /api/v1/health        → basic liveness probe
 * GET /api/v1/health/db     → deep check: verifies DB connectivity
 */

import { Router, Request, Response } from "express";
import db from "../config/db";
import { env } from "../config/env";
import { StatusCodes } from "http-status-codes";

const router = Router();

// ── Liveness probe ────────────────────────────────────────────
router.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "ZlipKart API is running",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    version: env.apiVersion,
  });
});

// ── Readiness probe — checks DB connectivity ─────────────────
router.get("/db", async (_req: Request, res: Response) => {
  try {
    // Execute the cheapest possible Prisma query
    await db.$queryRaw`SELECT 1`;
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Database connection healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      message: "Database connection failed",
      error: env.isDev ? String(err) : "DB unreachable",
    });
  }
});

export default router;
