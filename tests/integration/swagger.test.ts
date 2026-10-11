import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import app from "../../src/app";
import { setupSwagger, swaggerDocument } from "../../src/docs/swagger";
import * as envConfig from "../../src/config/env";

describe("Integration: Swagger Documentation", () => {
  describe("Developer / Non-production mode", () => {
    it("GET /docs/ should serve Swagger UI HTML", async () => {
      const res = await request(app).get("/docs/");

      expect(res.status).toBe(200);
      expect(res.text).toContain("Swagger UI");
    });

    it("GET /docs.json should serve the OpenAPI 3.0 JSON specification", async () => {
      const res = await request(app).get("/docs.json");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toEqual(swaggerDocument);
      expect(res.body.openapi).toBe("3.0.0");
      expect(res.body.info.title).toBe("JVE Portfolio API");

      // Verify all key endpoints are documented
      expect(res.body.paths["/health"]).toBeDefined();
      expect(res.body.paths["/user/signin"]).toBeDefined();
      expect(res.body.paths["/artPiece"]).toBeDefined();
      expect(res.body.paths["/artPiece/module"]).toBeDefined();
      expect(res.body.paths["/artPiece/subject"]).toBeDefined();
      expect(res.body.paths["/artPiece/portfolio"]).toBeDefined();
      expect(res.body.paths["/artPiece/{id}"]).toBeDefined();
      expect(res.body.paths["/media/{artPieceId}"]).toBeDefined();
    });
  });

  describe("Production mode (Developer mode disabled)", () => {
    it("should NOT mount /docs or /docs.json when NODE_ENV is production", async () => {
      const originalEnv = envConfig.env.NODE_ENV;
      (envConfig.env as any).NODE_ENV = "production";

      const prodApp = express();
      setupSwagger(prodApp);

      const docsRes = await request(prodApp).get("/docs");
      expect(docsRes.status).toBe(404);

      const jsonRes = await request(prodApp).get("/docs.json");
      expect(jsonRes.status).toBe(404);

      // Restore NODE_ENV
      (envConfig.env as any).NODE_ENV = originalEnv;
    });
  });
});
