import express from "express";
import cors from "cors";
import morgan from "morgan";
import artpieceRouter from "./routers/artpiece.router";
import mediaRouter from "./routers/media.router";
import userRouter from "./routers/user.router";
import { env } from "./config/env";

const app = express();

const WHITELIST = env.ALLOWED_ORIGINS;
var corsOptions = {
  origin: function (origin, callback) {
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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Server running healthy!" });
});

app.use("/artpiece", artpieceRouter);
app.use("/media", mediaRouter);
app.use("/user", userRouter);

app.use((err, _req, res, _next) => {
  res.json({ message: err });
});

export default app;
