/*
  Warnings:

  - You are about to drop the column `movingTextDescription` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `movingTextTitle` on the `PromotionHero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromotionHero" DROP COLUMN "movingTextDescription",
DROP COLUMN "movingTextTitle";

-- CreateTable
CREATE TABLE "MovingTextHero" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "siteContentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovingTextHero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovingTextHero_id_key" ON "MovingTextHero"("id");

-- AddForeignKey
ALTER TABLE "MovingTextHero" ADD CONSTRAINT "MovingTextHero_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
