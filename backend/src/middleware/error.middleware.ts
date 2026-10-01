import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ERROR_CODES } from "../shared/constants/error-codes";
import { AppError } from "../shared/errors/AppError";
import { errorBody } from "../shared/utils/api-response";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorBody(err.code, err.message));
    return;
  }

  console.error("Unhandled error:", err);

  const message = env.isProduction
    ? "An unexpected error occurred"
    : err instanceof Error
      ? err.message
      : "An unexpected error occurred";

  res.status(500).json(errorBody(ERROR_CODES.INTERNAL_ERROR, message));
}
