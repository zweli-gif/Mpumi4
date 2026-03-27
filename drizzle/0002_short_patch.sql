CREATE TABLE `ceoReflections` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);