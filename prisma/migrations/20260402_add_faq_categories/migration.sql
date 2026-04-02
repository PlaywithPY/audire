-- CreateTable
CREATE TABLE "FAQCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQCategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN "categoryId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FAQCategory_name_key" ON "FAQCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FAQCategory_slug_key" ON "FAQCategory"("slug");

-- CreateIndex
CREATE INDEX "FAQCategory_order_isVisible_idx" ON "FAQCategory"("order", "isVisible");

-- CreateIndex
CREATE INDEX "FAQ_categoryId_idx" ON "FAQ"("categoryId");

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FAQCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
