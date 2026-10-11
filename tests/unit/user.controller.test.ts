import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import userController from "../../src/controllers/user.controller";
import * as userService from "../../src/services/user.service";

vi.mock("../../src/services/user.service", () => ({
  signin: vi.fn(),
  createNewUser: vi.fn(),
}));

describe("User Controller Unit Tests", () => {
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
