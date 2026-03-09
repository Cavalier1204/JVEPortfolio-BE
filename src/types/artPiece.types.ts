import { z } from "zod";
import { Subject } from "./enums/subject";

export const CreateArtPieceSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  year: z.number().int().min(1).max(4),
  module: z.number().int().min(1).max(16),
  subject: z.enum(Subject),
  media: z.array(
    z.object({
      locationReference: z.string(),
      order: z.number().int(),
    }),
  ),
});

export type CreateArtPieceInput = z.infer<typeof CreateArtPieceSchema>;

export const GetArtPiecesQuerySchema = z.object({
  year: z.coerce.number().int().min(1).max(4),
  module: z.coerce.number().int().min(1).max(16),
});

export const GetArtPiecesSubjectQuerySchema = z.object({
  year: z.coerce.number().int().min(1).max(4),
  module: z.coerce.number().int().min(1).max(16),
  subject: z.enum(["werkpraktijk", "kennis", "positionering"]),
});
