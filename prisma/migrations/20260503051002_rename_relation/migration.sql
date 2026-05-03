/*
  Warnings:

  - You are about to drop the column `activeForId` on the `Endpoint` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Endpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedForId" TEXT,
    CONSTRAINT "Endpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Endpoint_selectedForId_fkey" FOREIGN KEY ("selectedForId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Endpoint" ("id", "isSelected", "url", "userId") SELECT "id", "isSelected", "url", "userId" FROM "Endpoint";
DROP TABLE "Endpoint";
ALTER TABLE "new_Endpoint" RENAME TO "Endpoint";
CREATE UNIQUE INDEX "Endpoint_userId_key" ON "Endpoint"("userId");
CREATE UNIQUE INDEX "Endpoint_selectedForId_key" ON "Endpoint"("selectedForId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
