/*
  Warnings:

  - You are about to drop the `Config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `activeById` on the `BackendEndpoint` table. All the data in the column will be lost.
  - You are about to drop the column `configId` on the `BackendEndpoint` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `BackendEndpoint` table. All the data in the column will be lost.
  - Added the required column `userId` to the `BackendEndpoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Config_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Config";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BackendEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeForId" TEXT,
    CONSTRAINT "BackendEndpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BackendEndpoint_activeForId_fkey" FOREIGN KEY ("activeForId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BackendEndpoint" ("endpoint", "id") SELECT "endpoint", "id" FROM "BackendEndpoint";
DROP TABLE "BackendEndpoint";
ALTER TABLE "new_BackendEndpoint" RENAME TO "BackendEndpoint";
CREATE UNIQUE INDEX "BackendEndpoint_userId_key" ON "BackendEndpoint"("userId");
CREATE UNIQUE INDEX "BackendEndpoint_activeForId_key" ON "BackendEndpoint"("activeForId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
