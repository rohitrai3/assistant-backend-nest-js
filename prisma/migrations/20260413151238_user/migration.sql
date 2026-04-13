/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LlmEndpoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `userId` to the `Config` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Config" ("id") SELECT "id" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");
CREATE TABLE "new_LlmEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "LlmEndpoint_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LlmEndpoint" ("configId", "endpoint", "id", "priority") SELECT "configId", "endpoint", "id", "priority" FROM "LlmEndpoint";
DROP TABLE "LlmEndpoint";
ALTER TABLE "new_LlmEndpoint" RENAME TO "LlmEndpoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
