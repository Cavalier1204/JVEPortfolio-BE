import express from "express";
import cors from "cors";
import protectedRouter from "./routers/protectedRouter";
import publicRouter from "./routers/publicRouter";
import morgan from "morgan";
import { protect } from "./middleware/auth";
import { signin } from "./services/user";
import { body } from "express-validator";
import { handleInputErrors } from "./middleware/middleware";

const app = express();

const corsOptions = {
  origin: JSON.parse(process.env.ALLOWED_ORIGINS ?? "[]"),
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server running healthy!" });
});

app.use("/api", protect, protectedRouter);
app.use("/public", publicRouter);

app.post(
  "/signin",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  signin,
);

app.use((err, req, res, next) => {
  res.json({ message: err });
});

export default app;
