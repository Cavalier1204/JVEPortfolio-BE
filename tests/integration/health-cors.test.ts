import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("Integration: Health & CORS", () => {
  describe("GET /health", () => {
    it("should return 200 and healthy status message", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "ok",
        message: "Server running healthy!",
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
  });
});
