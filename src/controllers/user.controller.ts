import { Request, Response, NextFunction } from "express";
import { signin, createNewUser } from "../services/user.service";

export const signinHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await signin(req.body);
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
  createNewUserHandler,
};
