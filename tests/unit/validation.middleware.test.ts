import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  validate,
  validateQuery,
} from "../../src/middleware/validation.middleware";

describe("Validation Middleware", () => {
  const schema = z.object({
    title: z.string(),
    year: z.coerce.number().int().min(1).max(4),
  });

  describe("validate (body)", () => {
    it("should parse valid body and call next()", () => {
      const req = {
        body: { title: "Test Piece", year: 2 },
      } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body).toEqual({ title: "Test Piece", year: 2 });
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 when body does not match schema", () => {
      const req = {
        body: { title: 123, year: 10 },
      } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should fallback to error.errors or [error.message] if issues is not defined", () => {
      const mockSchemaWithErrors = {
        parse: () => {
          throw { errors: ["Custom error"] };
        },
      } as any;
      const res1 = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next1 = vi.fn();
      validate(mockSchemaWithErrors)({ body: {} } as Request, res1, next1);
      expect(res1.json).toHaveBeenCalledWith({ errors: ["Custom error"] });

      const mockSchemaWithMessage = {
        parse: () => {
          throw new Error("Generic failure");
        },
      } as any;
      const res2 = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next2 = vi.fn();
      validate(mockSchemaWithMessage)({ body: {} } as Request, res2, next2);
      expect(res2.json).toHaveBeenCalledWith({ errors: ["Generic failure"] });
    });
  });

  describe("validateQuery", () => {
    it("should parse valid query and call next()", () => {
      const req = {
        query: { title: "Query Title", year: "3" },
      } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateQuery(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.query).toEqual({ title: "Query Title", year: 3 });
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 when query does not match schema", () => {
      const req = {
        query: { year: "not-a-number" },
      } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateQuery(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
