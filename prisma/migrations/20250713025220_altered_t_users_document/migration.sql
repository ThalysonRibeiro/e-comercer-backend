/*
  Warnings:

  - You are about to drop the column `cpf_or_cnpj` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "cpf_or_cnpj",
ADD COLUMN     "document" TEXT;
