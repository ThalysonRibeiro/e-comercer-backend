/*
  Warnings:

  - The `startDate` column on the `Promotions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Promotions" DROP COLUMN "startDate",
ADD COLUMN     "startDate" INTEGER;
