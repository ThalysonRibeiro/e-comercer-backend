/*
  Warnings:

  - The `color` column on the `options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id]` on the table `images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `options` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "options" DROP COLUMN "color",
ADD COLUMN     "color" TEXT[],
DROP COLUMN "size",
ADD COLUMN     "size" TEXT[];

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "assessment" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "images_id_key" ON "images"("id");

-- CreateIndex
CREATE UNIQUE INDEX "options_id_key" ON "options"("id");
