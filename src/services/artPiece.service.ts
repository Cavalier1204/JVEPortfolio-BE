import { validModules } from "../types/yearStructure";
import {
  CreateArtPieceInput,
  UpdateArtPieceInput,
} from "../types/artPiece.types";
import {
  ArtPieceNotFoundError,
  InvalidModuleError,
} from "../errors/domain.errors";
import { db } from "../drizzle/db";
import { artPiece, media, subject as subjectEnum } from "../drizzle/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Subject } from "../types/enums/subject";

export const createArtPiece = async (input: CreateArtPieceInput) => {
  const {
    title,
    description,
    year,
    module,
    media: mediaItems,
    subject,
  } = input;

  if (!validModules[year]?.includes(module)) {
    throw new InvalidModuleError("Invalid module for the specified year");
  }

  return await db.transaction(async (tx) => {
    const [artPieceRow] = await tx
      .insert(artPiece)
      .values({ title, description, year, module, subject })
      .returning();

    let insertedMedia: any[] = [];
    if (mediaItems && mediaItems.length > 0) {
      insertedMedia = await tx
        .insert(media)
        .values(
          mediaItems.map((item) => ({
            ...item,
            artPieceId: artPieceRow.id,
          })),
        )
        .returning();
    }

    return {
      ...artPieceRow,
      media: insertedMedia,
    };
  });
};

export const updateArtPiece = async (
  id: string,
  input: UpdateArtPieceInput,
) => {
  const {
    title,
    description,
    year,
    module,
    subject,
    updatedMedia,
    newMedia,
    deletedMedia,
  } = input;

  const [existing] = await db
    .select()
    .from(artPiece)
    .where(eq(artPiece.id, id));

  if (!existing) {
    throw new ArtPieceNotFoundError("Art piece not found");
  }

  const targetYear = year ?? existing.year;
  const targetModule = module ?? existing.module;

  if (!validModules[targetYear]?.includes(targetModule)) {
    throw new InvalidModuleError("Invalid module for the specified year");
  }

  return await db.transaction(async (tx) => {
    if (deletedMedia && deletedMedia.length > 0) {
      await tx.delete(media).where(inArray(media.id, deletedMedia));
    }

    if (newMedia && newMedia.length > 0) {
      await tx.insert(media).values(
        newMedia.map((item) => ({
          ...item,
          artPieceId: id,
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

    const updateData: Partial<typeof artPiece.$inferInsert> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (year !== undefined) updateData.year = year;
    if (module !== undefined) updateData.module = module;
    if (subject !== undefined) updateData.subject = subject;

    let updatedRow = existing;
    if (Object.keys(updateData).length > 0) {
      const [updated] = await tx
        .update(artPiece)
        .set(updateData)
        .where(eq(artPiece.id, id))
        .returning();
      updatedRow = updated;
    }

    const currentMedia = await tx
      .select()
      .from(media)
      .where(eq(media.artPieceId, id))
      .orderBy(asc(media.order));

    return {
      ...updatedRow,
      media: currentMedia,
    };
  });
};

export const deleteArtPiece = async (id: string) => {
  const [existing] = await db
    .select()
    .from(artPiece)
    .where(eq(artPiece.id, id));

  if (!existing) {
    throw new ArtPieceNotFoundError("Art piece not found");
  }

  return await db.transaction(async (tx) => {
    await tx.delete(media).where(eq(media.artPieceId, id));
    await tx.delete(artPiece).where(eq(artPiece.id, id));

    return { message: "Art piece and associated media deleted successfully" };
  });
};

export const findArtPieceById = async (id: string) => {
  const [found] = await db.select().from(artPiece).where(eq(artPiece.id, id));

  if (!found) {
    throw new ArtPieceNotFoundError("Art piece not found");
  }

  const mediaItems = await db
    .select()
    .from(media)
    .where(eq(media.artPieceId, id))
    .orderBy(asc(media.order));

  return {
    ...found,
    media: mediaItems,
  };
};

export const findArtPiecesByYearModule = async (
  year: number,
  moduleNumber: number,
) => {
  const pieces = await db
    .select()
    .from(artPiece)
    .where(and(eq(artPiece.year, year), eq(artPiece.module, moduleNumber)))
    .orderBy(asc(artPiece.createdAt));

  const pieceIds = pieces.map((p) => p.id);
  const mediaItems =
    pieceIds.length > 0
      ? await db
          .select()
          .from(media)
          .where(inArray(media.artPieceId, pieceIds))
          .orderBy(asc(media.order))
      : [];

  return pieces.map((p) => ({
    ...p,
    media: mediaItems.filter((m) => m.artPieceId === p.id),
  }));
};

export const findArtPiecesByYearModuleSubject = async (
  year: number,
  moduleNumber: number,
  subjectParam: string,
) => {
  let subjects: (typeof subjectEnum.enumValues)[number][];
  switch (subjectParam) {
    case "werkpraktijk":
      subjects = [Subject.WERKPRAKTIJK_1, Subject.WERKPRAKTIJK_2];
      break;
    case "kennis":
      subjects = [Subject.THEORIE, Subject.SKILLS];
      break;
    case "positionering":
      subjects = [Subject.POSITIONERING];
      break;
    default:
      throw new InvalidModuleError("Invalid subject");
  }

  const pieces = await db
    .select()
    .from(artPiece)
    .where(
      and(
        eq(artPiece.year, year),
        eq(artPiece.module, moduleNumber),
        inArray(artPiece.subject, subjects),
      ),
    )
    .orderBy(asc(artPiece.createdAt));

  const pieceIds = pieces.map((p) => p.id);
  const mediaItems =
    pieceIds.length > 0
      ? await db
          .select()
          .from(media)
          .where(inArray(media.artPieceId, pieceIds))
          .orderBy(asc(media.order))
      : [];

  return pieces.map((p) => ({
    ...p,
    media: mediaItems.filter((m) => m.artPieceId === p.id),
  }));
};

export const listPortfolioPieces = async () => {
  const pieces = await db
    .select()
    .from(artPiece)
    .where(eq(artPiece.subject, Subject.PORTFOLIO))
    .orderBy(asc(artPiece.createdAt));

  const pieceIds = pieces.map((p) => p.id);
  const mediaItems =
    pieceIds.length > 0
      ? await db
          .select()
          .from(media)
          .where(inArray(media.artPieceId, pieceIds))
          .orderBy(asc(media.order))
      : [];

  return pieces.map((p) => ({
    ...p,
    media: mediaItems.filter((m) => m.artPieceId === p.id),
  }));
};
