/**
 * src/app.ts
 *
 * Express Application Factory
 *
 * This file creates and configures the Express app — middleware
 * registration, route mounting, and error handling setup.
 *
 * It is intentionally SEPARATE from server.ts so the app
 * can be imported in tests without starting an HTTP server.
 *
 * ─────────────────────────────────────────────────────────────
 * MIDDLEWARE ORDER MATTERS — Express processes middleware in
 * registration order. Registering in wrong order causes bugs:
 *
 *  1. Security headers (helmet)     — FIRST: applied to ALL responses
 *  2. CORS                          — BEFORE routes: handles preflight OPTIONS
 *  3. Rate limiter                  — BEFORE body parsing: cheapest rejection
 *  4. Body parser (express.json)    — BEFORE routes: req.body must be populated
 *  5. Request logger (morgan)       — BEFORE routes: logs every request
 *  6. Routes                        — Business logic entry point
 *  7. 404 handler                   — AFTER routes: catches unmatched paths
 *  8. Error handler                 — LAST: catches all errors from routes
 * ─────────────────────────────────────────────────────────────
 */

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { API } from "./config/constants";
import { globalLimiter } from "./middlewares/rateLimiter";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import apiRouter from "./routes/index";

export const createApp = (): Application => {
  const app = express();

  // ── 1. Security Headers ─────────────────────────────────────
  // helmet sets 15+ HTTP headers (X-XSS-Protection, CSP, etc.)
  // Must be FIRST so headers are on every response, including errors
  app.use(helmet());

  // ── 2. CORS ─────────────────────────────────────────────────
  // Must come before routes so preflight OPTIONS requests are handled
  app.use(
    cors({
      origin: env.cors.origin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, // Allow cookies / auth headers
    })
  );

  // ── 3. Rate Limiting ────────────────────────────────────────
  // Applied before body parsing — reject overloaders before
  // we even spend CPU parsing their request bodies
  app.use(`${API.PREFIX}`, globalLimiter);

  // ── 4. Body Parsers ─────────────────────────────────────────
  // Must come before routes — req.body is undefined without this
  app.use(express.json({ limit: "10mb" }));           // Parse JSON bodies
  app.use(express.urlencoded({ extended: true }));    // Parse form data

  // ── 5. HTTP Request Logger ──────────────────────────────────
  // 'dev' format: colored, method, URL, status, response time
  // Only in non-production (or configure differently for prod)
  if (env.isDev) {
    app.use(morgan("dev"));
  } else {
    // 'combined' gives Apache-style logs useful for log aggregators
    app.use(morgan("combined"));
  }

  // ── 6. API Routes ────────────────────────────────────────────
  // All routes are mounted under the versioned prefix /api/v1
  app.use(API.PREFIX, apiRouter);

  // ── 7. Root route (sanity check) ─────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      message: "ZlipKart API",
      docs: `${API.PREFIX}/health`,
      version: env.apiVersion,
    });
  });

  // ── 8. 404 Handler ───────────────────────────────────────────
  // Registered AFTER all routes — only fires if no route matched
  app.use(notFound);

  // ── 9. Global Error Handler ──────────────────────────────────
  // MUST be the LAST middleware — receives errors via next(err)
  // 4-parameter signature tells Express this is an error handler
  app.use(errorHandler);

  return app;
};
