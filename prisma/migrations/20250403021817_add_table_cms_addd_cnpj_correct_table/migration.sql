-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cnpj" TEXT,
ALTER COLUMN "cpf" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "banner" TEXT,
    "video" TEXT,
    "bg_video" TEXT,
    "image_logo" TEXT NOT NULL,
    "title" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "favicon" TEXT,
    "footerText" TEXT,
    "themeColor" TEXT,
    "secondaryColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "banner" TEXT,
    "video" TEXT,
    "description" TEXT,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "couponCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteContentId" TEXT NOT NULL,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionHero" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "sale" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteContentId" TEXT NOT NULL,

    CONSTRAINT "PromotionHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" TEXT NOT NULL,
    "siteContentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "siteContentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_id_key" ON "SiteContent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Promotions_id_key" ON "Promotions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Promotions_slug_key" ON "Promotions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionHero_id_key" ON "PromotionHero"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_id_key" ON "SocialMedia"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_id_key" ON "ContactInfo"("id");

-- AddForeignKey
ALTER TABLE "Promotions" ADD CONSTRAINT "Promotions_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHero" ADD CONSTRAINT "PromotionHero_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
