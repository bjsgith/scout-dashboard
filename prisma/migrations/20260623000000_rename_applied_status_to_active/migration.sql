-- Rename the open, not-yet-advanced application status from Applied to Active.
-- SQLite cannot alter a column default directly, so rebuild Application while
-- preserving IDs and foreign-key relationships.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobTitle" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "reachedInterview" BOOLEAN NOT NULL DEFAULT false,
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

INSERT INTO "new_Application" (
    "city",
    "companyId",
    "createdAt",
    "dateApplied",
    "employmentType",
    "followUpDate",
    "id",
    "jobTitle",
    "jobUrl",
    "lastActivityAt",
    "notes",
    "pay",
    "platform",
    "reachedInterview",
    "state",
    "status",
    "updatedAt",
    "workMode"
)
SELECT
    "city",
    "companyId",
    "createdAt",
    "dateApplied",
    "employmentType",
    "followUpDate",
    "id",
    "jobTitle",
    "jobUrl",
    "lastActivityAt",
    "notes",
    "pay",
    "platform",
    "reachedInterview",
    "state",
    CASE WHEN "status" = 'Applied' THEN 'Active' ELSE "status" END,
    "updatedAt",
    "workMode"
FROM "Application";

DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");
CREATE INDEX "Application_status_idx" ON "Application"("status");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
