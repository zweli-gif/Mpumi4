CREATE TABLE `users` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `openId` TEXT NOT NULL UNIQUE,
    `name` TEXT,
    `email` TEXT,
    `loginMethod` TEXT,
    `role` TEXT NOT NULL DEFAULT 'user',
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `lastSignedIn` TEXT NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);