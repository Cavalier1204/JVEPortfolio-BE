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
    it("should generate a valid JWT token with user id, username, role, and 7d expiration", () => {
      const user = { id: "user-123", username: "testuser", role: "ADMIN" };
      const token = createJWT(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.role).toBe(user.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
    });
  });

  describe("protect", () => {
    it("should call next() and attach user when req.signedCookies.auth_token is valid", () => {
      const user = { id: "user-123", username: "cookieuser", role: "ADMIN" };
      const token = jwt.sign(user, env.JWT_SECRET);

      const req = {
        signedCookies: {
          auth_token: token,
        },
        headers: {},
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

    it("should return 401 when req.signedCookies.auth_token is invalid", () => {
      const req = {
        signedCookies: {
          auth_token: "invalid-cookie-token",
        },
        headers: {},
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

    it("should fall back to authorization header when signedCookies are not present", () => {
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

    it("should return 401 when both signedCookies and authorization header are missing", () => {
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

    it("should return 401 when bearer token is invalid or verification fails", () => {
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
    it("should hash password with 12 salt rounds and verify it correctly", async () => {
      const plain = "mySecretPassword123";
      const hash = await hashPassword(plain);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plain);
      expect(bcrypt.getRounds(hash)).toBe(12);

      const isValid = await comparePasswords(plain, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePasswords("wrongPassword", hash);
      expect(isInvalid).toBe(false);
    });
  });
});
