CREATE TABLE `weeklyActivities` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `userId` INTEGER NOT NULL,
    `activity` TEXT NOT NULL,
    `dueDay` TEXT NOT NULL,
    `dependency` TEXT,
    `accountabilityPartnerId` INTEGER,
    `monthlyGoalId` INTEGER,
    `status` TEXT NOT NULL DEFAULT 'pending',
    `weekNumber` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);