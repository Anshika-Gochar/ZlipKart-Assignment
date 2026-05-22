/**
 * src/utils/ApiError.ts
 *
 * Custom error class that carries an HTTP status code alongside
 * the error message. This is the ONLY error type thrown from
 * service and repository layers.
 *
 * WHY a custom error class?
 * ──────────────────────────
 * - Standard `Error` has no statusCode — the error handler
 *   would have to guess what HTTP status to send
 * - `ApiError` carries status, message, and optional details
 *   so the global error handler can respond consistently
 * - Makes service-layer intent crystal clear:
 *   throw new ApiError(404, "Product not found")
 *   vs. throw new Error("Product not found") // no status info
 *
 * HOW it flows:
 * ─────────────
 * service.ts → throws ApiError(404, "...")
 *            → asyncHandler catches it
 *            → passes to next(err)
 *            → errorHandler.ts sends the JSON response
 */

import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // true = expected business error; false = programming error
  public readonly details?: unknown;

  constructor(
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    message: string = "Something went wrong",
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Restore prototype chain (required when extending built-in classes in TS)
    Object.setPrototypeOf(this, ApiError.prototype);

    // Capture stack trace (V8 engines only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Static factory methods for common errors ──────────────

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.BAD_REQUEST, message, details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(StatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(StatusCodes.FORBIDDEN, message);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(StatusCodes.NOT_FOUND, `${resource} not found`);
  }

  static conflict(message: string): ApiError {
    return new ApiError(StatusCodes.CONFLICT, message);
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      message,
      undefined,
      false
    );
  }
}
