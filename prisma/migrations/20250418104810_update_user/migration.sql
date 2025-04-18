-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptOffers" BOOLEAN DEFAULT false,
ADD COLUMN     "acceptTerms" BOOLEAN DEFAULT false,
ADD COLUMN     "documentType" TEXT;
