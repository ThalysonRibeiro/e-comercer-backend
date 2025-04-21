/*
  Warnings:

  - You are about to drop the column `secondaryColor` on the `SiteContent` table. All the data in the column will be lost.
  - You are about to drop the column `themeColor` on the `SiteContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteContent" DROP COLUMN "secondaryColor",
DROP COLUMN "themeColor";

-- CreateTable
CREATE TABLE "ThemeColors" (
    "id" TEXT NOT NULL,
    "siteContentId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "hover" TEXT,
    "star" TEXT,
    "danger" TEXT,
    "price" TEXT,
    "title" TEXT,
    "textColor" TEXT,
    "oldPrice" TEXT,
    "borderColor" TEXT,
    "textButton" TEXT,
    "bgCard" TEXT,
    "themeColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeColors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemeColors_id_key" ON "ThemeColors"("id");

-- AddForeignKey
ALTER TABLE "ThemeColors" ADD CONSTRAINT "ThemeColors_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
