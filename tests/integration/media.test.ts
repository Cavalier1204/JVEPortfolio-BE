import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import * as mediaService from "../../src/services/media.service";

vi.mock("../../src/services/media.service", () => {
  return {
    updateMedia: vi.fn(),
  };
});

describe("Integration: /media", () => {
  const validToken = jwt.sign(
    { id: "user-1", username: "admin" },
    env.JWT_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT /media/:artPieceId", () => {
    it("happy flow: should return 204 when authorized with valid payload", async () => {
      vi.mocked(mediaService.updateMedia).mockResolvedValue(undefined as any);

      const payload = {
        deletedMedia: ["m-1"],
        newMedia: [{ locationReference: "http://image.png", order: 1 }],
        updatedMedia: [{ id: "m-2", order: 2 }],
      };

      const res = await request(app)
        .put("/media/art-123")
        .set("Authorization", `Bearer ${validToken}`)
        .send(payload);

      expect(res.status).toBe(204);
      expect(mediaService.updateMedia).toHaveBeenCalledWith("art-123", payload);
    });

    it("unhappy flow: should return 401 when no token is provided", async () => {
      const res = await request(app)
        .put("/media/art-123")
        .send({ deletedMedia: ["m-1"] });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
      expect(mediaService.updateMedia).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 401 when token is invalid", async () => {
      const res = await request(app)
        .put("/media/art-123")
        .set("Authorization", "Bearer bad-token")
        .send({ deletedMedia: ["m-1"] });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
      expect(mediaService.updateMedia).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when media payload fails validation", async () => {
      const invalidPayload = {
        newMedia: [{ locationReference: 123, order: "not-a-number" }],
      };

      const res = await request(app)
        .put("/media/art-123")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(mediaService.updateMedia).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 500 when service throws an unexpected error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(mediaService.updateMedia).mockRejectedValue(
        new Error("Database transaction failed"),
      );

      const res = await request(app)
        .put("/media/art-123")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
      consoleSpy.mockRestore();
    });
  });
});
