/*
  Warnings:

  - The `startDate` column on the `PromotionHero` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PromotionHero" DROP COLUMN "startDate",
ADD COLUMN     "startDate" INTEGER;
