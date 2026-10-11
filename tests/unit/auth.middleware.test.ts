import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  createJWT,
  protect,
  hashPassword,
  comparePasswords,
} from "../../src/middleware/auth.middleware";
import { env } from "../../src/config/env";

describe("Auth Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createJWT", () => {
    it("should generate a valid JWT token with user id and username", () => {
      const user = { id: "user-123", username: "testuser" };
      const token = createJWT(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
    });
  });

  describe("protect", () => {
    it("should call next() and attach user to req when authorization header is valid", () => {
      const user = { id: "user-123", username: "testuser" };
      const token = jwt.sign(user, env.JWT_SECRET);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as unknown as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      protect(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((req as any).user).toMatchObject(user);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is missing", () => {
      const req = {
        headers: {},
      } as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "not authorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header does not have a token", () => {
      const req = {
        headers: {
          authorization: "Bearer",
        },
      } as unknown as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "invalid token" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid or verification fails", () => {
      const req = {
        headers: {
          authorization: "Bearer invalid-jwt-token",
        },
      } as unknown as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "not authorized" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("hashPassword and comparePasswords", () => {
    it("should hash a password and verify it correctly", async () => {
      const plain = "mySecretPassword123";
      const hash = await hashPassword(plain);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plain);

      const isValid = await comparePasswords(plain, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePasswords("wrongPassword", hash);
      expect(isInvalid).toBe(false);
    });
  });
});
