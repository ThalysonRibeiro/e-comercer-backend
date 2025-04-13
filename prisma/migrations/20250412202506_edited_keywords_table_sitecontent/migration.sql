/*
  Warnings:

  - The `keywords` column on the `SiteContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SiteContent" DROP COLUMN "keywords",
ADD COLUMN     "keywords" TEXT[];
