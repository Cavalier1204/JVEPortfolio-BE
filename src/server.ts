import express from "express";
import protectedRouter from "./routers/protectedRouter";
import publicRouter from "./routers/publicRouter";
import morgan from "morgan";
import { protect } from "./modules/auth";
import { createNewUser, signin } from "./handlers/user";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", protect, protectedRouter);
app.use("/public", publicRouter);

app.post(
  "/user",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  createNewUser
);
app.post(
  "/signin",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  signin
);

app.use((err, req, res, next) => {
  res.json({ message: err });
});

export default app;
