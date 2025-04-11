/*
  Warnings:

  - You are about to drop the `Options` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Options" DROP CONSTRAINT "Options_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT[],
ADD COLUMN     "size" TEXT[];

-- DropTable
DROP TABLE "Options";
