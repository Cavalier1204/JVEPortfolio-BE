import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import * as userService from "../../src/services/user.service";
import { UnauthorizedError } from "../../src/errors/domain.errors";
import { createJWT } from "../../src/middleware/auth.middleware";
import { signinRateLimitStore } from "../../src/routers/user.router";

vi.mock("../../src/services/user.service", () => {
  return {
    signin: vi.fn(),
    createNewUser: vi.fn(),
    getMe: vi.fn(),
  };
});

describe("Integration: /user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signinRateLimitStore.resetAll();
  });

  describe("POST /user/signin", () => {
    it("happy flow: should return 200 with user DTO and set signed HttpOnly auth_token cookie", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        role: "ADMIN",
      };
      const mockToken = createJWT(mockUser);
      vi.mocked(userService.signin).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const res = await request(app)
        .post("/user/signin")
        .send({ username: "testuser", password: "validpassword" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(userService.signin).toHaveBeenCalledWith({
        username: "testuser",
        password: "validpassword",
      });

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/auth_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/);
    });

    it("rate limiting: should return 429 when exceeding signin request limit", async () => {
      vi.mocked(userService.signin).mockResolvedValue({
        token: "token",
        user: { id: "1", username: "testuser", role: "ADMIN" },
      });

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/user/signin")
          .send({ username: "testuser", password: "validpassword" });
      }

      const res = await request(app)
        .post("/user/signin")
        .send({ username: "testuser", password: "validpassword" });

      expect(res.status).toBe(429);
      expect(res.body).toEqual({
        error: "Too many sign-in attempts, please try again later.",
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

  describe("POST /user/logout", () => {
    it("should return 200 and clear the auth_token cookie", async () => {
      const res = await request(app).post("/user/logout");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "logged out successfully",
      });

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/auth_token=;/);
    });
  });

  describe("GET /user/me", () => {
    const validUser = { id: "user-123", username: "admin", role: "ADMIN" };
    const validToken = createJWT(validUser);

    it("should return 200 and current user info when authenticated via signed cookie", async () => {
      vi.mocked(userService.signin).mockResolvedValue({
        token: validToken,
        user: validUser,
      });
      vi.mocked(userService.getMe).mockResolvedValue(validUser);

      // Sign in first to obtain the signed cookie header
      const signinRes = await request(app)
        .post("/user/signin")
        .send({ username: "admin", password: "password123" });

      const cookieHeader = signinRes.headers["set-cookie"];

      const res = await request(app)
        .get("/user/me")
        .set("Cookie", cookieHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(validUser);
      expect(userService.getMe).toHaveBeenCalledWith("user-123");
    });

    it("should return 200 and current user info when authenticated via Authorization Bearer fallback", async () => {
      vi.mocked(userService.getMe).mockResolvedValue(validUser);

      const res = await request(app)
        .get("/user/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(validUser);
      expect(userService.getMe).toHaveBeenCalledWith("user-123");
    });

    it("should return 401 when no auth cookie or bearer token is provided", async () => {
      const res = await request(app).get("/user/me");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
    });

    it("should return 401 when bearer token is invalid", async () => {
      const res = await request(app)
        .get("/user/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
    });

    it("should return 401 when getMe throws UnauthorizedError", async () => {
      vi.mocked(userService.getMe).mockRejectedValue(
        new UnauthorizedError("access restricted"),
      );

      const res = await request(app)
        .get("/user/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "access restricted" });
    });
  });
});
