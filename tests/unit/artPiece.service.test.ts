import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createArtPiece,
  updateArtPiece,
  deleteArtPiece,
  findArtPieceById,
  findArtPiecesByYearModule,
  findArtPiecesByYearModuleSubject,
  listPortfolioPieces,
} from "../../src/services/artPiece.service";
import {
  InvalidModuleError,
  ArtPieceNotFoundError,
} from "../../src/errors/domain.errors";
import { db } from "../../src/drizzle/db";
import { Subject } from "../../src/types/enums/subject";

vi.mock("../../src/drizzle/db", () => {
  return {
    db: {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      transaction: vi.fn(),
    },
  };
});

describe("ArtPiece Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createArtPiece", () => {
    it("should throw InvalidModuleError if module is not valid for the year", async () => {
      await expect(
        createArtPiece({
          title: "Invalid Piece",
          year: 1,
          module: 10, // module 10 is for year 3
          subject: Subject.THEORIE,
          media: [],
        }),
      ).rejects.toThrow(InvalidModuleError);
    });

    it("should create artPiece and media in a transaction for valid input", async () => {
      const mockArtPieceRow = {
        id: "art-1",
        title: "Test Art",
        year: 1,
        module: 2,
        subject: Subject.THEORIE,
      };
      const mockMediaRow = {
        id: "med-1",
        artPieceId: "art-1",
        locationReference: "http://example.com/img.jpg",
        order: 1,
      };

      const txMock = {
        insert: vi
          .fn()
          .mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockArtPieceRow]),
            }),
          })
          .mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockMediaRow]),
            }),
          }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await createArtPiece({
        title: "Test Art",
        year: 1,
        module: 2,
        subject: Subject.THEORIE,
        media: [
          {
            locationReference: "http://example.com/img.jpg",
            order: 1,
          },
        ],
      });

      expect(db.transaction).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: "art-1",
        title: "Test Art",
      });
      expect(result.media).toHaveLength(1);
    });

    it("should handle creating art piece without media", async () => {
      const mockArtPieceRow = {
        id: "art-2",
        title: "Test Art No Media",
        year: 1,
        module: 1,
        subject: Subject.THEORIE,
      };

      const txMock = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockArtPieceRow]),
          }),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await createArtPiece({
        title: "Test Art No Media",
        year: 1,
        module: 1,
        subject: Subject.THEORIE,
        media: [],
      });

      expect(result.media).toEqual([]);
    });
  });

  describe("updateArtPiece", () => {
    it("should throw ArtPieceNotFoundError if art piece does not exist", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(
        updateArtPiece("nonexistent-id", {
          title: "New Title",
        }),
      ).rejects.toThrow(ArtPieceNotFoundError);
    });

    it("should throw InvalidModuleError if updated year/module combination is invalid", async () => {
      const mockExisting = {
        id: "art-1",
        year: 1,
        module: 1,
      };
      const whereMock = vi.fn().mockResolvedValue([mockExisting]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(
        updateArtPiece("art-1", {
          year: 1,
          module: 14, // invalid for year 1
        }),
      ).rejects.toThrow(InvalidModuleError);
    });

    it("should update artPiece and handle media within transaction", async () => {
      const mockExisting = {
        id: "art-1",
        title: "Old Title",
        year: 1,
        module: 1,
      };
      const mockUpdated = {
        id: "art-1",
        title: "New Title",
        year: 1,
        module: 1,
      };
      const mockMedia = [
        { id: "m-1", artPieceId: "art-1", order: 1 },
      ];

      const whereMock = vi.fn().mockResolvedValue([mockExisting]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const txMock = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockUpdated]),
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockMedia),
            }),
          }),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await updateArtPiece("art-1", {
        title: "New Title",
        deletedMedia: ["m-old"],
        newMedia: [{ locationReference: "http://new.jpg", order: 2 }],
        updatedMedia: [{ id: "m-1", order: 1 }],
      });

      expect(db.transaction).toHaveBeenCalled();
      expect(result.title).toBe("New Title");
      expect(result.media).toEqual(mockMedia);
    });

    it("should handle partial updates with description, module fallback, and undefined media order", async () => {
      const mockExisting = {
        id: "art-1",
        title: "Old Title",
        description: "Old Desc",
        year: 2,
        module: 5,
        subject: Subject.THEORIE,
      };

      const whereMock = vi.fn().mockResolvedValue([mockExisting]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const txMock = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ ...mockExisting, module: 6 }]),
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await updateArtPiece("art-1", {
        description: "New Desc",
        module: 6, // year is undefined, falls back to existing.year = 2
        subject: Subject.SKILLS,
        updatedMedia: [{ id: "m-1", order: undefined }],
      });

      expect(result.module).toBe(6);
    });

    it("should handle update without modifying any art piece fields (empty updateData)", async () => {
      const mockExisting = {
        id: "art-1",
        title: "Old Title",
        year: 1,
        module: 1,
      };

      const whereMock = vi.fn().mockResolvedValue([mockExisting]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const txMock = {
        update: vi.fn(),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await updateArtPiece("art-1", {});

      expect(result.title).toBe("Old Title");
      expect(txMock.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteArtPiece", () => {
    it("should throw ArtPieceNotFoundError when art piece to delete does not exist", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(deleteArtPiece("nonexistent-id")).rejects.toThrow(
        ArtPieceNotFoundError,
      );
    });

    it("should delete media and artPiece within transaction", async () => {
      const mockExisting = { id: "art-1" };
      const whereMock = vi.fn().mockResolvedValue([mockExisting]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const txMock = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const result = await deleteArtPiece("art-1");
      expect(db.transaction).toHaveBeenCalled();
      expect(txMock.delete).toHaveBeenCalledTimes(2);
      expect(result.message).toContain("deleted successfully");
    });
  });

  describe("findArtPieceById", () => {
    it("should throw ArtPieceNotFoundError when art piece is not found", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      await expect(findArtPieceById("nonexistent-id")).rejects.toThrow(
        ArtPieceNotFoundError,
      );
    });

    it("should return art piece with its media", async () => {
      const mockPiece = { id: "art-1", title: "Art 1" };
      const mockMedia = [{ id: "m-1", artPieceId: "art-1", order: 1 }];

      const wherePieceMock = vi.fn().mockResolvedValue([mockPiece]);
      const fromPieceMock = vi.fn().mockReturnValue({ where: wherePieceMock });

      const orderByMediaMock = vi.fn().mockResolvedValue(mockMedia);
      const whereMediaMock = vi.fn().mockReturnValue({ orderBy: orderByMediaMock });
      const fromMediaMock = vi.fn().mockReturnValue({ where: whereMediaMock });

      (db.select as any)
        .mockReturnValueOnce({ from: fromPieceMock })
        .mockReturnValueOnce({ from: fromMediaMock });

      const result = await findArtPieceById("art-1");
      expect(result.id).toBe("art-1");
      expect(result.media).toEqual(mockMedia);
    });
  });

  describe("findArtPiecesByYearModule", () => {
    it("should return art pieces with associated media", async () => {
      const mockPieces = [
        { id: "art-1", year: 1, module: 2 },
        { id: "art-2", year: 1, module: 2 },
      ];
      const mockMedia = [
        { id: "m-1", artPieceId: "art-1", order: 1 },
        { id: "m-2", artPieceId: "art-2", order: 1 },
      ];

      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPieces),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockMedia),
            }),
          }),
        });

      const result = await findArtPiecesByYearModule(1, 2);
      expect(result).toHaveLength(2);
      expect(result[0].media).toEqual([mockMedia[0]]);
      expect(result[1].media).toEqual([mockMedia[1]]);
    });

    it("should return empty array if no pieces found", async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await findArtPiecesByYearModule(1, 2);
      expect(result).toEqual([]);
    });
  });

  describe("findArtPiecesByYearModuleSubject", () => {
    it("should query correctly for werkpraktijk", async () => {
      const mockPieces = [{ id: "art-1", subject: Subject.WERKPRAKTIJK_1 }];
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPieces),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await findArtPiecesByYearModuleSubject(1, 1, "werkpraktijk");
      expect(result).toHaveLength(1);
    });

    it("should query correctly for kennis", async () => {
      const mockPieces = [{ id: "art-2", subject: Subject.THEORIE }];
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPieces),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await findArtPiecesByYearModuleSubject(1, 1, "kennis");
      expect(result).toHaveLength(1);
    });

    it("should query correctly for positionering", async () => {
      const mockPieces = [{ id: "art-3", subject: Subject.POSITIONERING }];
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPieces),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await findArtPiecesByYearModuleSubject(1, 1, "positionering");
      expect(result).toHaveLength(1);
    });

    it("should throw InvalidModuleError for unknown subject query", async () => {
      await expect(
        findArtPiecesByYearModuleSubject(1, 1, "invalid_subject"),
      ).rejects.toThrow(InvalidModuleError);
    });
  });

  describe("listPortfolioPieces", () => {
    it("should return portfolio art pieces with media", async () => {
      const mockPieces = [{ id: "port-1", subject: Subject.PORTFOLIO }];
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockPieces),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await listPortfolioPieces();
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe(Subject.PORTFOLIO);
    });

    it("should return empty array if no portfolio pieces found", async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await listPortfolioPieces();
      expect(result).toEqual([]);
    });

    it("should return empty array if no subject pieces found", async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await findArtPiecesByYearModuleSubject(1, 1, "kennis");
      expect(result).toEqual([]);
    });
  });
});
