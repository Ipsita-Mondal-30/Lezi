import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getMe } from "./auth.controller";

const authRouter = Router();

authRouter.get("/me", authMiddleware, asyncHandler(getMe));

export { authRouter };
