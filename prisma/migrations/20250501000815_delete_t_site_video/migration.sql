/*
  Warnings:

  - You are about to drop the column `bg_video` on the `SiteContent` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `SiteContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteContent" DROP COLUMN "bg_video",
DROP COLUMN "video";
