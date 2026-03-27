CREATE TABLE `strategicObjectives` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` TEXT NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 20,
    `icon` TEXT DEFAULT 'Target',
    `color` TEXT DEFAULT 'text-blue-600',
    `bgColor` TEXT DEFAULT 'bg-blue-50 border-blue-200',
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `year` INTEGER NOT NULL,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);