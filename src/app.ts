import express from "express";
import cors from "cors";
import morgan from "morgan";
import artPieceRouter from "./routers/artPiece.router";
import mediaRouter from "./routers/media.router";
import userRouter from "./routers/user.router";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { setupSwagger } from "./docs/swagger";

const app = express();

const WHITELIST = env.ALLOWED_ORIGINS;
var corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (arg0: Error | null, arg1?: boolean | undefined) => void,
  ) {
    if (!origin) return callback(null, true);

    if (WHITELIST.indexOf(origin) !== -1) {
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
app.use(cors(corsOptions));

setupSwagger(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Server running healthy!" });
});

app.use("/artPiece", artPieceRouter);
app.use("/media", mediaRouter);
app.use("/user", userRouter);

app.use(errorHandler);

export default app;
