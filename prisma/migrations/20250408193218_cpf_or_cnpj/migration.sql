/*
  Warnings:

  - You are about to drop the column `cnpj` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "cnpj",
DROP COLUMN "cpf",
ADD COLUMN     "cpf_or_cnpj" TEXT;
