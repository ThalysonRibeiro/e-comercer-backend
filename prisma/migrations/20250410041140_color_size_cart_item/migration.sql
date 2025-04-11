/*
  Warnings:

  - You are about to drop the column `options` on the `CartItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "options",
ADD COLUMN     "color" TEXT[],
ADD COLUMN     "size" TEXT[];
