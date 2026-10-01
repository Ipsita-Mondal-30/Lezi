import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { ERROR_CODES } from "../../shared/constants/error-codes";
import { success } from "../../shared/utils/api-response";
import { getAuthenticatedApplicationUser } from "./auth.service";

export async function getMe(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "Authentication required"
    );
  }

  const user = await getAuthenticatedApplicationUser(req.user.id, req.user.email);
  res.status(200).json(success({ user }));
}
