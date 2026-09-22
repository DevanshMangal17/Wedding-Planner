/*
  Warnings:

  - Added the required column `neededByDate` to the `SOSCase` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SOSCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "neededByDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "SOSCase_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SOSCase" ("category", "createdAt", "description", "id", "resolvedAt", "status", "title", "weddingId") SELECT "category", "createdAt", "description", "id", "resolvedAt", "status", "title", "weddingId" FROM "SOSCase";
DROP TABLE "SOSCase";
ALTER TABLE "new_SOSCase" RENAME TO "SOSCase";
CREATE INDEX "SOSCase_weddingId_idx" ON "SOSCase"("weddingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
