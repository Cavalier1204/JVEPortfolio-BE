import { describe, it, expect } from "vitest";
import { mediaRelations, artPieceRelations } from "../../src/drizzle/relations";

describe("Drizzle Relations", () => {
  it("should define mediaRelations and artPieceRelations", () => {
    expect(mediaRelations).toBeDefined();
    expect(artPieceRelations).toBeDefined();
  });
});
