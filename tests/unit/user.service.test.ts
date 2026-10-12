import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNewUser, signin, getMe } from "../../src/services/user.service";
import { UnauthorizedError, AdminAlreadyExistsError } from "../../src/errors/domain.errors";
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
    it("should hash password, insert user, and return JWT token and user when no user exists", async () => {
      const mockCreatedUser = {
        id: "user-uuid-1",
        username: "johndoe",
        password: "hashedPassword123",
        role: "ADMIN",
      };

      const fromMock = vi.fn().mockResolvedValue([]);
      (db.select as any).mockReturnValue({ from: fromMock });

      const returningMock = vi.fn().mockResolvedValue([mockCreatedUser]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const result = await createNewUser({
        username: "johndoe",
        password: "secretPassword",
      });

      expect(db.select).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(result.token).toBeDefined();
      expect(result.user).toEqual(mockCreatedUser);
    });

    it("should throw AdminAlreadyExistsError when a user already exists (strictly 1 admin maximum)", async () => {
      const fromMock = vi.fn().mockResolvedValue([{ id: "admin-id", username: "existingadmin" }]);
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(
        createNewUser({
          username: "secondadmin",
          password: "secretPassword",
        }),
      ).rejects.toThrow(AdminAlreadyExistsError);

      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe("signin", () => {
    it("should return JWT token and user DTO when credentials are valid", async () => {
      const hashedPassword = await authMiddleware.hashPassword("correctPassword");
      const mockExistingUser = {
        id: "user-uuid-1",
        username: "johndoe",
        password: hashedPassword,
        role: "ADMIN",
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
      expect(result.user).toEqual({
        id: "user-uuid-1",
        username: "johndoe",
        role: "ADMIN",
      });
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

  describe("getMe", () => {
    it("should return user info when user is found", async () => {
      const mockUser = {
        id: "user-uuid-1",
        username: "johndoe",
        role: "ADMIN",
      };

      const whereMock = vi.fn().mockResolvedValue([mockUser]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const result = await getMe("user-uuid-1");

      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedError when user is not found", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(getMe("nonexistent-user-id")).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });
});
