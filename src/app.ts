import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import artPieceRouter from "./routers/artPiece.router";
import mediaRouter from "./routers/media.router";
import userRouter from "./routers/user.router";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { setupSwagger } from "./docs/swagger";
import { db } from "./drizzle/db";
import { sql } from "drizzle-orm";

const app = express();

const WHITELIST = env.ALLOWED_ORIGINS;
const localOrigins = [
  `http://localhost:${env.PORT}`,
  `http://127.0.0.1:${env.PORT}`,
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (arg0: Error | null, arg1?: boolean | undefined) => void,
  ) {
    if (!origin) return callback(null, true);

    const isWhitelisted = WHITELIST.includes(origin);
    const isLocalDev =
      env.NODE_ENV !== "production" && localOrigins.includes(origin);

    if (isWhitelisted || isLocalDev) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.JWT_SECRET));
app.use(cors(corsOptions));

setupSwagger(app);

app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: "ok", message: "Server running healthy!" });
  } catch {
    res
      .status(503)
      .json({ status: "error", message: "Database connection failed" });
  }
});

app.use("/artPiece", artPieceRouter);
app.use("/media", mediaRouter);
app.use("/user", userRouter);

app.use(errorHandler);

export default app;
