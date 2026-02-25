import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation.middleware";
import { signin } from "../services/user.services";

const router = Router();

router.post(
  "/signin",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  signin,
);

export default router;
