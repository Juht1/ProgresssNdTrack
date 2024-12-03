/*
  Warnings:

  - Added the required column `recipient` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipient" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reminder" ("eventId", "id") SELECT "eventId", "id" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
