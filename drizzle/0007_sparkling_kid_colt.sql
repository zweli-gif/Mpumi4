ALTER TABLE `annualGoals` MODIFY COLUMN `ownerId` int;--> statement-breakpoint
ALTER TABLE `annualGoals` ADD `strategicObjective` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `annualGoals` ADD `goalName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `annualGoals` ADD `ownerName` varchar(255);--> statement-breakpoint
ALTER TABLE `annualGoals` DROP COLUMN `category`;--> statement-breakpoint
ALTER TABLE `annualGoals` DROP COLUMN `description`;