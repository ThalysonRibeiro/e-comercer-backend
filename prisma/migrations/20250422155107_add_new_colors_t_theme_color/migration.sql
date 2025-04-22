-- AlterTable
ALTER TABLE "ThemeColors" ADD COLUMN     "isDarkTheme" BOOLEAN DEFAULT false,
ADD COLUMN     "shadowColor" TEXT,
ADD COLUMN     "success" TEXT,
ADD COLUMN     "warning" TEXT;
