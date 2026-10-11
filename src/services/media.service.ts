import { db } from "../drizzle/db";
import { media } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

export interface UpdateMediaInput {
  deletedMedia?: string[];
  newMedia?: Array<{
    locationReference: string;
    order: number;
  }>;
  updatedMedia?: Array<{
    id: string;
    order?: number;
  }>;
}

export const updateMedia = async (
  artPieceId: string,
  input: UpdateMediaInput,
) => {
  const { deletedMedia, newMedia, updatedMedia } = input;

  await db.transaction(async (tx) => {
    if (deletedMedia && deletedMedia.length > 0) {
      await tx.delete(media).where(inArray(media.id, deletedMedia));
    }

    if (newMedia && newMedia.length > 0) {
      await tx.insert(media).values(
        newMedia.map((item) => ({
          locationReference: item.locationReference,
          order: item.order,
          artPieceId,
        })),
      );
    }

    if (updatedMedia && updatedMedia.length > 0) {
      for (const item of updatedMedia) {
        if (item.order !== undefined) {
          await tx
            .update(media)
            .set({ order: item.order })
            .where(eq(media.id, item.id));
        }
      }
    }
  });
};
