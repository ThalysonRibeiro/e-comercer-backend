/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `PromotionHero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromotionHero" DROP COLUMN "backgroundColor",
ADD COLUMN     "service" TEXT[];
