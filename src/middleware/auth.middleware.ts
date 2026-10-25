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
      ...(user.role ? { role: user.role } : {}),
    },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  return token;
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined =
    typeof req.signedCookies?.auth_token === "string"
      ? req.signedCookies.auth_token
      : undefined;

  if (!token) {
    const bearer = req.headers.authorization;

    if (!bearer) {
      res.status(401).json({ message: "not authorized" });
      return;
    }

    const [, bearerToken] = bearer.split(" ");
    if (!bearerToken) {
      res.status(401).json({ message: "invalid token" });
      return;
    }

    token = bearerToken;
  }

  try {
    const user = jwt.verify(token, env.JWT_SECRET);
    req.user = user as UserPayload;
    next();
  } catch {
    res.status(401).json({ message: "not authorized" });
    return;
  }
};

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 12);
};
