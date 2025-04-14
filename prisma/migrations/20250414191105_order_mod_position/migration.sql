/*
  Warnings:

  - You are about to drop the column `order` on the `Promotions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotions" DROP COLUMN "order",
ADD COLUMN     "position" TEXT NOT NULL DEFAULT '';
