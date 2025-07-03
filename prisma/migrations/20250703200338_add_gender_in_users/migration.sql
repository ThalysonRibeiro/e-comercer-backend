/*
  Warnings:

  - You are about to drop the column `genero` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "genero",
ADD COLUMN     "gender" TEXT;
