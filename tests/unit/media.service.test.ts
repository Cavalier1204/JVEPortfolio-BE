import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateMedia } from "../../src/services/media.service";
import { db } from "../../src/drizzle/db";

vi.mock("../../src/drizzle/db", () => {
  return {
    db: {
      transaction: vi.fn(),
    },
  };
});

describe("Media Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateMedia", () => {
    it("should process deletedMedia, newMedia, and updatedMedia within transaction", async () => {
      const txMock = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      await updateMedia("artpiece-123", {
        deletedMedia: ["media-1", "media-2"],
        newMedia: [
          { locationReference: "http://example.com/new.jpg", order: 1 },
        ],
        updatedMedia: [
          { id: "media-3", order: 2 },
          { id: "media-4", order: undefined },
        ],
      });

      expect(db.transaction).toHaveBeenCalled();
      expect(txMock.delete).toHaveBeenCalled();
      expect(txMock.insert).toHaveBeenCalled();
      expect(txMock.update).toHaveBeenCalled();
    });

    it("should handle empty inputs gracefully without unnecessary queries", async () => {
      const txMock = {
        delete: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
      };

      (db.transaction as any).mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      await updateMedia("artpiece-123", {});

      expect(db.transaction).toHaveBeenCalled();
      expect(txMock.delete).not.toHaveBeenCalled();
      expect(txMock.insert).not.toHaveBeenCalled();
      expect(txMock.update).not.toHaveBeenCalled();
    });
  });
});
