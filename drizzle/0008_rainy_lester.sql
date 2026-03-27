ALTER TABLE `monthlyTargets` ADD COLUMN `isLocked` INTEGER DEFAULT 0;
ALTER TABLE `monthlyTargets` ADD COLUMN `performanceStatus` TEXT;