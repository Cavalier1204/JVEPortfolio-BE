import { Request, Response, NextFunction } from "express";
import { signin, createNewUser, getMe } from "../services/user.service";
import { env } from "../config/env";

export const signinHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await signin(req.body);
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      signed: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(result.user);
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.clearCookie("auth_token");
  return res.status(200).json({ message: "logged out successfully" });
};

export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMe(req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createNewUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createNewUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export default {
  signinHandler,
  logoutHandler,
  meHandler,
  createNewUserHandler,
};
