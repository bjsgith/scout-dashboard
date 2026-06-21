-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobTitle" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "dateApplied" DATETIME,
    "platform" TEXT,
    "employmentType" TEXT,
    "city" TEXT,
    "state" TEXT,
    "workMode" TEXT,
    "pay" TEXT,
    "jobUrl" TEXT,
    "notes" TEXT,
    "followUpDate" DATETIME,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("city", "companyId", "createdAt", "dateApplied", "employmentType", "followUpDate", "id", "jobTitle", "jobUrl", "lastActivityAt", "notes", "pay", "platform", "state", "status", "updatedAt", "workMode") SELECT "city", "companyId", "createdAt", "dateApplied", "employmentType", "followUpDate", "id", "jobTitle", "jobUrl", "lastActivityAt", "notes", "pay", "platform", "state", "status", "updatedAt", "workMode" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");
CREATE INDEX "Application_status_idx" ON "Application"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
