import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import userController from "../../src/controllers/user.controller";
import * as userService from "../../src/services/user.service";

vi.mock("../../src/services/user.service", () => ({
  signin: vi.fn(),
  createNewUser: vi.fn(),
  getMe: vi.fn(),
}));

describe("User Controller Unit Tests", () => {
  it("signinHandler should set signed cookie and return 200 with user DTO on success", async () => {
    const mockResult = {
      token: "jwt-token-xyz",
      user: { id: "user-1", username: "admin", role: "ADMIN" },
    };
    vi.mocked(userService.signin).mockResolvedValue(mockResult);

    const req = {
      body: { username: "admin", password: "password123" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.signinHandler(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      "auth_token",
      "jwt-token-xyz",
      expect.objectContaining({
        httpOnly: true,
        signed: true,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult.user);
    expect(next).not.toHaveBeenCalled();
  });

  it("signinHandler should call next(err) on error", async () => {
    const error = new Error("Invalid credentials");
    vi.mocked(userService.signin).mockRejectedValue(error);

    const req = {
      body: { username: "admin", password: "wrong" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.signinHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("logoutHandler should clear cookie and return 200", async () => {
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.logoutHandler(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("auth_token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "logged out successfully",
    });
  });

  it("meHandler should return current user info on success", async () => {
    const mockUser = { id: "user-1", username: "admin", role: "ADMIN" };
    vi.mocked(userService.getMe).mockResolvedValue(mockUser);

    const req = {
      user: { id: "user-1", username: "admin", role: "ADMIN" },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.meHandler(req, res, next);

    expect(userService.getMe).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
    expect(next).not.toHaveBeenCalled();
  });

  it("meHandler should call next(err) on error", async () => {
    const error = new Error("User not found");
    vi.mocked(userService.getMe).mockRejectedValue(error);

    const req = {
      user: { id: "user-unknown" },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.meHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("createNewUserHandler should return 201 on success", async () => {
    const mockResult = {
      token: "jwt-token",
      user: { id: "1", username: "newuser" },
    };
    vi.mocked(userService.createNewUser).mockResolvedValue(mockResult as any);

    const req = {
      body: { username: "newuser", password: "password" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.createNewUserHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("createNewUserHandler should call next(err) on error", async () => {
    const error = new Error("Creation failed");
    vi.mocked(userService.createNewUser).mockRejectedValue(error);

    const req = {
      body: { username: "newuser", password: "password" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await userController.createNewUserHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
