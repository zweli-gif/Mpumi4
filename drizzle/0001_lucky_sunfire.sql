
CREATE TABLE `activityLog` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `userId` INTEGER NOT NULL,
    `actionType` TEXT NOT NULL,
    `entityType` TEXT NOT NULL,
    `entityId` INTEGER NOT NULL,
    `oldValue` TEXT,
    `newValue` TEXT,
    `description` TEXT,
    `timestamp` INTEGER NOT NULL,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `annualGoals` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `category` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `targetValue` REAL NOT NULL,
    `targetUnit` TEXT NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `distributionStrategy` TEXT NOT NULL DEFAULT 'linear',
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `celebrations` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT,
    `category` TEXT NOT NULL,
    `icon` TEXT DEFAULT '🎉',
    `celebrationDate` TEXT NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `taggedUsers` TEXT,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `dashboardMetrics` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `metricKey` TEXT NOT NULL UNIQUE,
    `metricValue` TEXT NOT NULL,
    `lastCalculated` TEXT NOT NULL,
    `expiresAt` TEXT,
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `healthCheckins` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `userId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `mood` TEXT NOT NULL,
    `energyLevel` TEXT NOT NULL,
    `notes` TEXT,
    `checkinDate` TEXT NOT NULL,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `insights` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `metricName` TEXT NOT NULL,
    `insightType` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `priority` TEXT DEFAULT 'medium',
    `generatedAt` TEXT NOT NULL,
    `validUntil` TEXT,
    `metadata` TEXT,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `monthlyTargets` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `goalId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `targetValue` REAL NOT NULL,
    `actualValue` REAL DEFAULT 0,
    `weight` REAL,
    `rationale` TEXT,
    `notes` TEXT,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `performanceSnapshots` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `metricName` TEXT NOT NULL,
    `metricCategory` TEXT NOT NULL,
    `value` REAL NOT NULL,
    `unit` TEXT,
    `snapshotDate` TEXT NOT NULL,
    `metadata` TEXT,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `pipelineCards` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `stageId` INTEGER NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT,
    `value` REAL,
    `currency` TEXT DEFAULT 'ZAR',
    `ownerId` INTEGER,
    `dueDate` TEXT,
    `tags` TEXT,
    `metadata` TEXT,
    `position` INTEGER DEFAULT 0,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `movedAt` TEXT
);

CREATE TABLE `pipelineStages` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `pipelineType` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `order` INTEGER NOT NULL,
    `probabilityWeight` INTEGER DEFAULT 0,
    `color` TEXT,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `systemSettings` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `settingKey` TEXT NOT NULL UNIQUE,
    `settingValue` TEXT NOT NULL,
    `settingType` TEXT NOT NULL DEFAULT 'string',
    `description` TEXT,
    `updatedBy` INTEGER,
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `weeklyPriorities` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `userId` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `status` TEXT NOT NULL DEFAULT 'pending',
    `dueDate` TEXT NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `linkedGoalId` INTEGER,
    `createdAt` TEXT NOT NULL DEFAULT (datetime('now')),
    `updatedAt` TEXT NOT NULL DEFAULT (datetime('now'))
);
