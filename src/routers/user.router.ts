import { Router } from "express";
import { handleInputErrors } from "../middleware/validation.middleware";
import { signin } from "../services/user.service";

const router = Router();

router.post(
  "/signin",
  body("username").isString(),
  body("password").isString(),
  handleInputErrors,
  signin,
);

export default router;
