/*
  Warnings:

  - The values [ativo,inativo] on the enum `AccountStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `min_purchase` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `total_amount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `total_quantity` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `discount_amount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `PaymentDetail` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `old_price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `price` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `discount_type` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `discount_amount` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'refunded', 'partially_refunded', 'failed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'REFUND', 'EXPENSE', 'OTHER_INCOME');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('FIXED', 'VARIABLE', 'SHIPPING', 'TAX', 'OTHER');

-- CreateEnum
CREATE TYPE "CostFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "StockEventType" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'LOSS');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('NEW', 'RETURNING', 'LOYAL', 'VIP', 'AT_RISK', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('FIXED', 'PERCENTAGE');

-- AlterEnum
BEGIN;
CREATE TYPE "AccountStatus_new" AS ENUM ('active', 'inactive');
ALTER TABLE "User" ALTER COLUMN "status" TYPE "AccountStatus_new" USING ("status"::text::"AccountStatus_new");
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
ALTER TYPE "AccountStatus_new" RENAME TO "AccountStatus";
DROP TYPE "AccountStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "appliedCoupon" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "hasDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "min_purchase" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "discount_type",
ADD COLUMN     "discount_type" "CouponType" NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "total_quantity" SET DATA TYPE INTEGER,
ALTER COLUMN "discount_amount" SET NOT NULL,
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItems" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PaymentDetail" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cost_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "profit_margin" DECIMAL(10,2),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "old_price" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "orderId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceSummary" (
    "id" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodValue" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalSales" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "profit" DECIMAL(12,2) NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesStat" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodType" "PeriodType" NOT NULL,
    "totalRevenue" DECIMAL(12,2) NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "averageOrderValue" DECIMAL(10,2) NOT NULL,
    "conversionRate" DECIMAL(5,2),
    "visits" INTEGER,
    "newCustomers" INTEGER,
    "topProducts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalCost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "CostType" NOT NULL,
    "frequency" "CostFrequency" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "StockEventType" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "costPerUnit" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(10,2) NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "status" "CampaignStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSpent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastPurchaseDate" TIMESTAMP(3),
    "segment" "CustomerSegment" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "favorites" TEXT[],
    "hiddenItems" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSummary_id_key" ON "BalanceSummary"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SalesStat_id_key" ON "SalesStat"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalCost_id_key" ON "OperationalCost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StockEvent_id_key" ON "StockEvent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingCampaign_id_key" ON "MarketingCampaign"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMetric_id_key" ON "UserMetric"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tax_id_key" ON "Tax"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_id_key" ON "ProductCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardConfig_id_key" ON "DashboardConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialLog_id_key" ON "FinancialLog"("id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEvent" ADD CONSTRAINT "StockEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetric" ADD CONSTRAINT "UserMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardConfig" ADD CONSTRAINT "DashboardConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
