/*
  Warnings:

  - You are about to drop the `LlmEndpoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LlmEndpoint";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BackendEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "BackendEndpoint_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
