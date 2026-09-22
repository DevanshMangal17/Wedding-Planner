-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "priceMin" INTEGER NOT NULL,
    "priceMax" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "capacityMin" INTEGER,
    "capacityMax" INTEGER,
    "styleTags" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "reliabilityScore" INTEGER NOT NULL,
    "avgResponseHours" INTEGER NOT NULL,
    "pastBookings" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "imageEmoji" TEXT NOT NULL DEFAULT '✨',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "isPanIndia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Vendor" ("avgResponseHours", "capacityMax", "capacityMin", "category", "city", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "id", "imageEmoji", "isDemo", "name", "pastBookings", "priceMax", "priceMin", "rating", "reliabilityScore", "reviewCount", "services", "styleTags") SELECT "avgResponseHours", "capacityMax", "capacityMin", "category", "city", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "id", "imageEmoji", "isDemo", "name", "pastBookings", "priceMax", "priceMin", "rating", "reliabilityScore", "reviewCount", "services", "styleTags" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
CREATE INDEX "Vendor_category_idx" ON "Vendor"("category");
CREATE INDEX "Vendor_city_idx" ON "Vendor"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
