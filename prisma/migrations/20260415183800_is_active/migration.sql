/*
  Warnings:

  - You are about to drop the column `priority` on the `LlmEndpoint` table. All the data in the column will be lost.
  - Added the required column `isActive` to the `LlmEndpoint` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LlmEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "LlmEndpoint_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LlmEndpoint" ("configId", "endpoint", "id") SELECT "configId", "endpoint", "id" FROM "LlmEndpoint";
DROP TABLE "LlmEndpoint";
ALTER TABLE "new_LlmEndpoint" RENAME TO "LlmEndpoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
