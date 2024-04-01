-- CreateTable
CREATE TABLE "ArtPiece" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "module" INTEGER NOT NULL,

    CONSTRAINT "ArtPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationReference" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "artPieceId" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_artPieceId_fkey" FOREIGN KEY ("artPieceId") REFERENCES "ArtPiece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
