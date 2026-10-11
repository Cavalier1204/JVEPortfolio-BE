import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { UserPayload } from "../types/express";

export const createJWT = (user: UserPayload) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    env.JWT_SECRET,
  );
  return token;
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).json({ message: "not authorized" });
    return;
  }

  const [, token] = bearer.split(" ");
  if (!token) {
    res.status(401).json({ message: "invalid token" });
    return;
  }

  try {
    const user = jwt.verify(token, env.JWT_SECRET);
    req.user = user as UserPayload;
    next();
  } catch (e) {
    res.status(401).json({ message: "not authorized" });
    return;
  }
};

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};
