/*
  Warnings:

  - Added the required column `subject` to the `ArtPiece` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('WERKPRAKTIJK_1', 'WERKPRAKTIJK_2', 'THEORIE', 'SKILLS', 'POSITIONERING');

-- AlterTable
ALTER TABLE "ArtPiece" ADD COLUMN     "subject" "Subject" NOT NULL;
