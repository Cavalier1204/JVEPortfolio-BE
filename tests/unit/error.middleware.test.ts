import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middleware/error.middleware";
import {
  InvalidModuleError,
  ArtPieceNotFoundError,
  UnauthorizedError,
  AdminAlreadyExistsError,
} from "../../src/errors/domain.errors";

describe("Error Middleware", () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it("should handle InvalidModuleError and return 400 with error message", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new InvalidModuleError("Invalid module for the specified year");
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid module for the specified year",
    });
  });

  it("should handle ArtPieceNotFoundError and return 404 with error message", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new ArtPieceNotFoundError("Art piece not found");
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Art piece not found",
    });
  });

  it("should handle UnauthorizedError and return 401 with error message", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new UnauthorizedError("access restricted");
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "access restricted",
    });
  });

  it("should handle AdminAlreadyExistsError and return 409 with error message", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new AdminAlreadyExistsError("Admin user already exists");
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Admin user already exists",
    });
  });

  it("should handle unknown/generic errors and return 500 with Internal server error", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Database connection lost");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
    consoleSpy.mockRestore();
  });
});
