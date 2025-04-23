/*
  Warnings:

  - You are about to drop the column `service` on the `PromotionHero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromotionHero" DROP COLUMN "service";

-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "service" TEXT[];
