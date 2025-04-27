/*
  Warnings:

  - You are about to drop the column `buttonLink` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `sale` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `subTitle` on the `PromotionHero` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PromotionHero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromotionHero" DROP COLUMN "buttonLink",
DROP COLUMN "buttonText",
DROP COLUMN "description",
DROP COLUMN "sale",
DROP COLUMN "subTitle",
DROP COLUMN "title",
ADD COLUMN     "promotionLink" TEXT;
