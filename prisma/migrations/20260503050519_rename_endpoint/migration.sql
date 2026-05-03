/*
  Warnings:

  - You are about to drop the column `endpoint` on the `Endpoint` table. All the data in the column will be lost.
  - Added the required column `isSelected` to the `Endpoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Endpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "activeForId" TEXT,
    CONSTRAINT "Endpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Endpoint_activeForId_fkey" FOREIGN KEY ("activeForId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Endpoint" ("activeForId", "id", "userId") SELECT "activeForId", "id", "userId" FROM "Endpoint";
DROP TABLE "Endpoint";
ALTER TABLE "new_Endpoint" RENAME TO "Endpoint";
CREATE UNIQUE INDEX "Endpoint_userId_key" ON "Endpoint"("userId");
CREATE UNIQUE INDEX "Endpoint_activeForId_key" ON "Endpoint"("activeForId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
