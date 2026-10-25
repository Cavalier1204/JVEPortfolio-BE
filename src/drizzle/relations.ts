import { relations } from "drizzle-orm/relations";
import { artPiece, media } from "./schema";

export const mediaRelations = relations(media, ({ one }) => ({
  artPiece: one(artPiece, {
    fields: [media.artPieceId],
    references: [artPiece.id],
  }),
}));

export const artPieceRelations = relations(artPiece, ({ many }) => ({
  media: many(media),
}));
