import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { success } from "./shared/utils/api-response";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json(success({ status: "ok" }));
  });

  app.use("/api/v1/auth", authRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
