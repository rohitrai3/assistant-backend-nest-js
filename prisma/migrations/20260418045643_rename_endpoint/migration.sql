/*
  Warnings:

  - You are about to drop the `BackendEndpoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BackendEndpoint";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Endpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeForId" TEXT,
    CONSTRAINT "Endpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Endpoint_activeForId_fkey" FOREIGN KEY ("activeForId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_userId_key" ON "Endpoint"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_activeForId_key" ON "Endpoint"("activeForId");
