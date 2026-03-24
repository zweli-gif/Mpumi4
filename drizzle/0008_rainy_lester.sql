ALTER TABLE `monthlyTargets` ADD `isLocked` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `monthlyTargets` ADD `performanceStatus` enum('green','amber','red');