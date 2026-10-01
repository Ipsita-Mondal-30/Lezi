import type { Request, Response } from "express";
import { ERROR_CODES } from "../shared/constants/error-codes";
import { errorBody } from "../shared/utils/api-response";

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json(errorBody(ERROR_CODES.NOT_FOUND, "Route not found"));
}
