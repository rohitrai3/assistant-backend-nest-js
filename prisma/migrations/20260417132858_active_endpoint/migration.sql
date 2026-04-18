-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BackendEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "configId" TEXT NOT NULL,
    "activeById" TEXT,
    CONSTRAINT "BackendEndpoint_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BackendEndpoint_activeById_fkey" FOREIGN KEY ("activeById") REFERENCES "Config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BackendEndpoint" ("configId", "endpoint", "id", "isActive") SELECT "configId", "endpoint", "id", "isActive" FROM "BackendEndpoint";
DROP TABLE "BackendEndpoint";
ALTER TABLE "new_BackendEndpoint" RENAME TO "BackendEndpoint";
CREATE UNIQUE INDEX "BackendEndpoint_activeById_key" ON "BackendEndpoint"("activeById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
