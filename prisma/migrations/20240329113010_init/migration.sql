/*
  Warnings:

  - You are about to drop the column `kunstItemId` on the `image` table. All the data in the column will be lost.
  - You are about to drop the `kunstitem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `artPieceId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_kunstItemId_fkey`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `kunstItemId`,
    ADD COLUMN `artPieceId` VARCHAR(191) NOT NULL,
    MODIFY `image` LONGBLOB NOT NULL;

-- DropTable
DROP TABLE `kunstitem`;

-- CreateTable
CREATE TABLE `ArtPiece` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NULL,
    `year` INTEGER NOT NULL,
    `module` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_artPieceId_fkey` FOREIGN KEY (`artPieceId`) REFERENCES `ArtPiece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
