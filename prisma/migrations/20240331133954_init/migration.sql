/*
  Warnings:

  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `artpiece` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_artPieceId_fkey`;

-- AlterTable
ALTER TABLE `artpiece` MODIFY `description` LONGTEXT NOT NULL;

-- DropTable
DROP TABLE `image`;

-- CreateTable
CREATE TABLE `Media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `locationReference` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `artPieceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_artPieceId_fkey` FOREIGN KEY (`artPieceId`) REFERENCES `ArtPiece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
