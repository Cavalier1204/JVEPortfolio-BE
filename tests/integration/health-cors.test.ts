import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../src/drizzle/db", () => ({
  db: {
    execute: vi.fn(),
  },
  pool: {
    end: vi.fn(),
  },
}));

import { db } from "../../src/drizzle/db";
import app from "../../src/app";

describe("Integration: Health & CORS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.execute).mockResolvedValue([{ 1: 1 }] as any);
  });

  describe("GET /health", () => {
    it("should return 200 and healthy status message when database is connected", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "ok",
        message: "Server running healthy!",
      });
      expect(db.execute).toHaveBeenCalled();
    });

    it("should return 503 when database connection ping fails", async () => {
      vi.mocked(db.execute).mockRejectedValueOnce(
        new Error("Database connection timeout"),
      );

      const res = await request(app).get("/health");

      expect(res.status).toBe(503);
      expect(res.body).toEqual({
        status: "error",
        message: "Database connection failed",
      });
    });
  });

  describe("CORS behavior", () => {
    it("should allow requests from whitelisted origin", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5173",
      );
    });

    it("should allow requests with no Origin header (e.g. server-to-server / curl)", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
    });

    it("should reject requests from non-whitelisted origin", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://unauthorized-domain.com");

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          error: "Internal server error",
        }),
      );
    });

    it("should reject requests from origin that contains whitelisted origin as substring", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173.attacker.com");

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          error: "Internal server error",
        }),
      );
    });
  });
});
