import { Subject } from "@prisma/client";

export interface CreateArtPieceInput {
  title: string;
  description?: string;
  year: number;
  module: number;
  subject?: Subject;
  media: {
    locationReference: string;
    order: number;
  }[];
}
