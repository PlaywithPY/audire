-- CreateTable
CREATE TABLE IF NOT EXISTS "Centre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phoneFixe" TEXT NOT NULL,
    "phoneMobile" TEXT,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Centre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Centre_slug_key" ON "Centre"("slug");
CREATE INDEX IF NOT EXISTS "Centre_postalCode_idx" ON "Centre"("postalCode");
CREATE INDEX IF NOT EXISTS "Centre_isActive_idx" ON "Centre"("isActive");

-- Insert default centre to link existing hours (only if it doesn't exist)
INSERT INTO "Centre" ("name", "slug", "phoneFixe", "phoneMobile", "email", "address", "postalCode", "city", "isActive", "isDefault", "latitude", "longitude", "createdAt", "updatedAt")
SELECT 'Audire Jemeppe', 'jemeppe', '+32 4 234 56 78', '+32 476 12 34 56', 'jemeppe@audire.be', E'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse', '4101', 'Jemeppe-sur-Meuse', true, true, 50.6197, 5.4981, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Centre" WHERE "slug" = 'jemeppe');

-- AddForeignKey - Add centreId column to OpeningHours with default value (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OpeningHours' AND column_name = 'centreId'
    ) THEN
        ALTER TABLE "OpeningHours" ADD COLUMN "centreId" INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- DropIndex - Remove old unique constraint on dayOfWeek only
DROP INDEX IF EXISTS "OpeningHours_dayOfWeek_key";

-- CreateIndex - Add new unique constraint on centreId + dayOfWeek
CREATE UNIQUE INDEX IF NOT EXISTS "OpeningHours_centreId_dayOfWeek_key" ON "OpeningHours"("centreId", "dayOfWeek");
CREATE INDEX IF NOT EXISTS "OpeningHours_centreId_idx" ON "OpeningHours"("centreId");

-- AddForeignKey (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'OpeningHours_centreId_fkey'
        AND table_name = 'OpeningHours'
    ) THEN
        ALTER TABLE "OpeningHours" ADD CONSTRAINT "OpeningHours_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Remove default value now that existing rows have been updated
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OpeningHours'
        AND column_name = 'centreId'
        AND column_default IS NOT NULL
    ) THEN
        ALTER TABLE "OpeningHours" ALTER COLUMN "centreId" DROP DEFAULT;
    END IF;
END $$;
