import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("dotenv/config", () => ({}));

describe("Config: env.ts", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should throw an error when a required environment variable is missing", async () => {
    delete process.env.ALLOWED_ORIGINS;

    await expect(import("../../src/config/env")).rejects.toThrow(
      "Missing environment variable: ALLOWED_ORIGINS",
    );
  });

  it("should fall back to defaults when PORT or DB_PORT are not set", async () => {
    delete process.env.PORT;
    delete process.env.DB_PORT;
    delete process.env.NODE_ENV;
    process.env.ALLOWED_ORIGINS = '["http://localhost:5173"]';
    process.env.DATABASE_URL = "postgres://test";
    process.env.JWT_SECRET = "secret";
    process.env.DB_HOST = "localhost";
    process.env.DB_USERNAME = "user";
    process.env.DB_PASSWORD = "password";
    process.env.DB_NAME = "dbname";

    const { env } = await import("../../src/config/env");
    expect(env.PORT).toBe(3000);
    expect(env.DB.PORT).toBe(5432);
    expect(env.NODE_ENV).toBe("development");
  });
});
