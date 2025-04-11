/*
  Warnings:

  - You are about to alter the column `discount_value` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Changed the type of `discount_type` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "discount_value" SET DATA TYPE INTEGER,
DROP COLUMN "discount_type",
ADD COLUMN     "discount_type" INTEGER NOT NULL;
