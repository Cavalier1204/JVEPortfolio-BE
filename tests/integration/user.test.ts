import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import * as userService from "../../src/services/user.service";
import { UnauthorizedError } from "../../src/errors/domain.errors";

vi.mock("../../src/services/user.service", () => {
  return {
    signin: vi.fn(),
    createNewUser: vi.fn(),
  };
});

describe("Integration: /user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /user/signin", () => {
    it("happy flow: should return 200 and token for valid credentials", async () => {
      vi.mocked(userService.signin).mockResolvedValue({
        token: "mocked-jwt-token-xyz",
      });

      const res = await request(app)
        .post("/user/signin")
        .send({ username: "testuser", password: "validpassword" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        token: "mocked-jwt-token-xyz",
      });
      expect(userService.signin).toHaveBeenCalledWith({
        username: "testuser",
        password: "validpassword",
      });
    });

    it("unhappy flow: should return 400 when username or password is missing", async () => {
      const res = await request(app)
        .post("/user/signin")
        .send({ username: "onlyUser" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(userService.signin).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when fields are empty strings", async () => {
      const res = await request(app)
        .post("/user/signin")
        .send({ username: "", password: "" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(userService.signin).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 401 when service throws UnauthorizedError", async () => {
      vi.mocked(userService.signin).mockRejectedValue(
        new UnauthorizedError("access restricted"),
      );

      const res = await request(app)
        .post("/user/signin")
        .send({ username: "wronguser", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: "access restricted",
      });
    });
  });
});
