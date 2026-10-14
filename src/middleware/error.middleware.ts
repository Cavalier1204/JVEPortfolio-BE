import { DomainError } from "../errors/domain.errors";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal server error",
  });
};
