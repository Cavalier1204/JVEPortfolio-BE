import { Router } from "express";
import { z } from "zod";
import { rateLimit, MemoryStore } from "express-rate-limit";
import { validate } from "../middleware/validation.middleware";
import { protect } from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";

const router = Router();

export const SigninSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const signinRateLimitStore = new MemoryStore();

export const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: signinRateLimitStore,
  message: { error: "Too many sign-in attempts, please try again later." },
});

router.post(
  "/signin",
  signinLimiter,
  validate(SigninSchema),
  userController.signinHandler,
);

router.post("/logout", userController.logoutHandler);

router.get("/me", protect, userController.meHandler);

export default router;
