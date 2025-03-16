-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('useradmin', 'userdefault');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ativo', 'inativo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "type" "AccountType" NOT NULL,
    "name" TEXT,
    "cpf" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "googleId" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
