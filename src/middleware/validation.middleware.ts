import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ZodObject } from "zod";

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

export const parseQueryToInt = (req, res, next) => {
  for (const key in req.query) {
    if (req.query.hasOwnProperty(key)) {
      const value = req.query[key];
      const parsedValue = parseInt(value);
      if (!isNaN(parsedValue)) {
        req.query[key] = parsedValue;
      }
    }
  }
  next();
};

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({ errors: error.errors });
    }
  };

export const validateQuery =
  (schema: ZodObject<any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      return res.status(400).json({ errors: error.errors });
    }
  };
