import type { NextFunction, Request, Response } from "express";
import { supabaseAuth } from "../config/supabase";
import { ERROR_CODES } from "../shared/constants/error-codes";
import { AppError } from "../shared/errors/AppError";
import { asyncHandler } from "../shared/utils/async-handler";

function unauthorized(message: string): AppError {
  return new AppError(401, ERROR_CODES.UNAUTHORIZED, message);
}

export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header) {
      throw unauthorized("Authentication required");
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw unauthorized("Malformed authorization header");
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      throw unauthorized("Invalid or expired token");
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
    };

    next();
  }
);
