import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import * as artPieceService from "../../src/services/artPiece.service";
import {
  InvalidModuleError,
  ArtPieceNotFoundError,
} from "../../src/errors/domain.errors";
import { Subject } from "../../src/types/enums/subject";

vi.mock("../../src/services/artPiece.service", () => {
  return {
    createArtPiece: vi.fn(),
    updateArtPiece: vi.fn(),
    deleteArtPiece: vi.fn(),
    findArtPieceById: vi.fn(),
    findArtPiecesByYearModule: vi.fn(),
    findArtPiecesByYearModuleSubject: vi.fn(),
    listPortfolioPieces: vi.fn(),
  };
});

describe("Integration: /artPiece", () => {
  const validToken = jwt.sign(
    { id: "user-1", username: "admin" },
    env.JWT_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /artPiece", () => {
    const validBody = {
      title: "Sculpture 1",
      description: "A nice sculpture",
      year: 1,
      module: 2,
      subject: Subject.THEORIE,
      media: [
        {
          locationReference: "http://example.com/sculpture.png",
          order: 1,
        },
      ],
    };

    it("happy flow: should return 201 with created art piece when authorized", async () => {
      const mockCreated = { id: "art-1", ...validBody };
      vi.mocked(artPieceService.createArtPiece).mockResolvedValue(mockCreated);

      const res = await request(app)
        .post("/artPiece")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ data: mockCreated });
      expect(artPieceService.createArtPiece).toHaveBeenCalledWith(validBody);
    });

    it("unhappy flow: should return 401 when Authorization header is missing", async () => {
      const res = await request(app).post("/artPiece").send(validBody);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
      expect(artPieceService.createArtPiece).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/artPiece")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          description: "Missing title, year, module, subject, media",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(artPieceService.createArtPiece).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when module is out of valid range for year", async () => {
      vi.mocked(artPieceService.createArtPiece).mockRejectedValue(
        new InvalidModuleError("Invalid module for the specified year"),
      );

      const res = await request(app)
        .post("/artPiece")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid module for the specified year",
      });
    });
  });

  describe("GET /artPiece/:id", () => {
    it("happy flow: should return 200 with art piece data", async () => {
      const mockPiece = {
        id: "piece-123",
        title: "Oil Painting",
        media: [],
      };
      vi.mocked(artPieceService.findArtPieceById).mockResolvedValue(
        mockPiece as any,
      );

      const res = await request(app).get("/artPiece/piece-123");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: mockPiece });
      expect(artPieceService.findArtPieceById).toHaveBeenCalledWith(
        "piece-123",
      );
    });

    it("unhappy flow: should return 404 when art piece is not found", async () => {
      vi.mocked(artPieceService.findArtPieceById).mockRejectedValue(
        new ArtPieceNotFoundError("Art piece not found"),
      );

      const res = await request(app).get("/artPiece/nonexistent-id");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Art piece not found" });
    });
  });

  describe("GET /artPiece/module", () => {
    it("happy flow: should return 200 with art pieces for year and module", async () => {
      const mockPieces = [{ id: "p-1", year: 2, module: 5 }];
      vi.mocked(artPieceService.findArtPiecesByYearModule).mockResolvedValue(
        mockPieces as any,
      );

      const res = await request(app).get("/artPiece/module?year=2&module=5");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: mockPieces });
      expect(artPieceService.findArtPiecesByYearModule).toHaveBeenCalledWith(
        2,
        5,
      );
    });

    it("unhappy flow: should return 400 when query parameters are missing or invalid", async () => {
      const res = await request(app).get("/artPiece/module?year=5&module=99");

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(artPieceService.findArtPiecesByYearModule).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 500 when service throws unexpected error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(artPieceService.findArtPiecesByYearModule).mockRejectedValue(
        new Error("Database failure"),
      );

      const res = await request(app).get("/artPiece/module?year=1&module=1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
      consoleSpy.mockRestore();
    });
  });

  describe("GET /artPiece/subject", () => {
    it("happy flow: should return 200 with art pieces matching subject query", async () => {
      const mockPieces = [
        { id: "p-1", year: 1, module: 2, subject: Subject.WERKPRAKTIJK_1 },
      ];
      vi.mocked(
        artPieceService.findArtPiecesByYearModuleSubject,
      ).mockResolvedValue(mockPieces as any);

      const res = await request(app).get(
        "/artPiece/subject?year=1&module=2&subject=werkpraktijk",
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: mockPieces });
      expect(
        artPieceService.findArtPiecesByYearModuleSubject,
      ).toHaveBeenCalledWith(1, 2, "werkpraktijk");
    });

    it("unhappy flow: should return 400 when subject query is not in allowed enum", async () => {
      const res = await request(app).get(
        "/artPiece/subject?year=1&module=2&subject=unsupported_subject",
      );

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(
        artPieceService.findArtPiecesByYearModuleSubject,
      ).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 500 when service throws unexpected error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(
        artPieceService.findArtPiecesByYearModuleSubject,
      ).mockRejectedValue(new Error("Database failure"));

      const res = await request(app).get(
        "/artPiece/subject?year=1&module=1&subject=werkpraktijk",
      );

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
      consoleSpy.mockRestore();
    });
  });

  describe("GET /artPiece/portfolio", () => {
    it("happy flow: should return 200 with portfolio art pieces", async () => {
      const mockPortfolio = [{ id: "port-1", subject: Subject.PORTFOLIO }];
      vi.mocked(artPieceService.listPortfolioPieces).mockResolvedValue(
        mockPortfolio as any,
      );

      const res = await request(app).get("/artPiece/portfolio");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: mockPortfolio });
      expect(artPieceService.listPortfolioPieces).toHaveBeenCalled();
    });

    it("unhappy flow: should return 500 when service throws unexpected error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(artPieceService.listPortfolioPieces).mockRejectedValue(
        new Error("Database failure"),
      );

      const res = await request(app).get("/artPiece/portfolio");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });
      consoleSpy.mockRestore();
    });
  });

  describe("PUT /artPiece/:id", () => {
    const updateBody = {
      title: "Updated Title",
      year: 2,
      module: 6,
    };

    it("happy flow: should return 200 with updated art piece when authorized", async () => {
      const mockUpdated = { id: "art-1", ...updateBody };
      vi.mocked(artPieceService.updateArtPiece).mockResolvedValue(
        mockUpdated as any,
      );

      const res = await request(app)
        .put("/artPiece/art-1")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: mockUpdated });
      expect(artPieceService.updateArtPiece).toHaveBeenCalledWith(
        "art-1",
        updateBody,
      );
    });

    it("unhappy flow: should return 401 when unauthorized", async () => {
      const res = await request(app).put("/artPiece/art-1").send(updateBody);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
      expect(artPieceService.updateArtPiece).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when validation fails", async () => {
      const res = await request(app)
        .put("/artPiece/art-1")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ year: 99 }); // invalid year > 4

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(artPieceService.updateArtPiece).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 400 when InvalidModuleError occurs", async () => {
      vi.mocked(artPieceService.updateArtPiece).mockRejectedValue(
        new InvalidModuleError("Invalid module for the specified year"),
      );

      const res = await request(app)
        .put("/artPiece/art-1")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid module for the specified year",
      });
    });

    it("unhappy flow: should return 404 when art piece is not found", async () => {
      vi.mocked(artPieceService.updateArtPiece).mockRejectedValue(
        new ArtPieceNotFoundError("Art piece not found"),
      );

      const res = await request(app)
        .put("/artPiece/nonexistent")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateBody);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Art piece not found" });
    });
  });

  describe("DELETE /artPiece/:id", () => {
    it("happy flow: should return 200 with deletion message when authorized", async () => {
      vi.mocked(artPieceService.deleteArtPiece).mockResolvedValue({
        message: "Art piece and associated media deleted successfully",
      } as any);

      const res = await request(app)
        .delete("/artPiece/art-1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Art piece and associated media deleted successfully",
      });
      expect(artPieceService.deleteArtPiece).toHaveBeenCalledWith("art-1");
    });

    it("unhappy flow: should return 401 when unauthorized", async () => {
      const res = await request(app).delete("/artPiece/art-1");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "not authorized" });
      expect(artPieceService.deleteArtPiece).not.toHaveBeenCalled();
    });

    it("unhappy flow: should return 404 when art piece does not exist", async () => {
      vi.mocked(artPieceService.deleteArtPiece).mockRejectedValue(
        new ArtPieceNotFoundError("Art piece not found"),
      );

      const res = await request(app)
        .delete("/artPiece/nonexistent")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Art piece not found" });
    });
  });
});
