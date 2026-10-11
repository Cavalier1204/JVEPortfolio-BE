import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validation.middleware";
import userController from "../controllers/user.controller";

const router = Router();

export const SigninSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/signin", validate(SigninSchema), userController.signinHandler);

export default router;
