import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNewUser, signin } from "../../src/services/user.service";
import { UnauthorizedError } from "../../src/errors/domain.errors";
import { db } from "../../src/drizzle/db";
import * as authMiddleware from "../../src/middleware/auth.middleware";

vi.mock("../../src/drizzle/db", () => {
  return {
    db: {
      insert: vi.fn(),
      select: vi.fn(),
    },
  };
});

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNewUser", () => {
    it("should hash password, insert user, and return JWT token and user", async () => {
      const mockCreatedUser = {
        id: "user-uuid-1",
        username: "johndoe",
        password: "hashedPassword123",
      };

      const returningMock = vi.fn().mockResolvedValue([mockCreatedUser]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const result = await createNewUser({
        username: "johndoe",
        password: "secretPassword",
      });

      expect(db.insert).toHaveBeenCalled();
      expect(result.token).toBeDefined();
      expect(result.user).toEqual(mockCreatedUser);
    });
  });

  describe("signin", () => {
    it("should return JWT token when credentials are valid", async () => {
      const hashedPassword = await authMiddleware.hashPassword("correctPassword");
      const mockExistingUser = {
        id: "user-uuid-1",
        username: "johndoe",
        password: hashedPassword,
      };

      const whereMock = vi.fn().mockResolvedValue([mockExistingUser]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const result = await signin({
        username: "johndoe",
        password: "correctPassword",
      });

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
    });

    it("should throw UnauthorizedError when user is not found", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(
        signin({
          username: "nonexistent",
          password: "password",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when password does not match", async () => {
      const hashedPassword = await authMiddleware.hashPassword("correctPassword");
      const mockExistingUser = {
        id: "user-uuid-1",
        username: "johndoe",
        password: hashedPassword,
      };

      const whereMock = vi.fn().mockResolvedValue([mockExistingUser]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(
        signin({
          username: "johndoe",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
