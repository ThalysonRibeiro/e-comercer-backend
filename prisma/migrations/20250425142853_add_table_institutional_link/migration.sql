-- CreateTable
CREATE TABLE "InstitutionalLink" (
    "id" TEXT NOT NULL,
    "siteContentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionalLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionalLink_id_key" ON "InstitutionalLink"("id");

-- AddForeignKey
ALTER TABLE "InstitutionalLink" ADD CONSTRAINT "InstitutionalLink_siteContentId_fkey" FOREIGN KEY ("siteContentId") REFERENCES "SiteContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
