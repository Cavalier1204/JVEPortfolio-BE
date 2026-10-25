import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      const errors = error.issues ?? error.errors ?? [error.message];
      return res.status(400).json({ errors });
    }
  };

export const validateQuery =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      if (!res.locals) {
        res.locals = {};
      }
      res.locals.query = parsed;
      try {
        req.query = parsed as any;
      } catch {
        Object.assign(req.query, parsed);
      }
      next();
    } catch (error: any) {
      const errors = error.issues ?? error.errors ?? [error.message];
      return res.status(400).json({ errors });
    }
  };
