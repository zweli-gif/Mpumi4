CREATE TABLE `activityLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` enum('card_moved','card_created','card_updated','priority_added','priority_completed','health_checkin','celebration_added','goal_created','goal_updated','target_updated') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`oldValue` text,
	`newValue` text,
	`description` text,
	`timestamp` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `annualGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('revenue','ventures','studio','clients','finance','team','admin') NOT NULL,
	`description` text NOT NULL,
	`targetValue` decimal(15,2) NOT NULL,
	`targetUnit` varchar(50) NOT NULL,
	`ownerId` int NOT NULL,
	`year` int NOT NULL,
	`distributionStrategy` enum('linear','custom','historical','milestone') NOT NULL DEFAULT 'linear',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `annualGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `celebrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` enum('deal','birthday','milestone','project','personal') NOT NULL,
	`icon` varchar(10) DEFAULT '🎉',
	`celebrationDate` timestamp NOT NULL,
	`createdBy` int NOT NULL,
	`taggedUsers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `celebrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricKey` varchar(100) NOT NULL,
	`metricValue` text NOT NULL,
	`lastCalculated` timestamp NOT NULL,
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboardMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `dashboardMetrics_metricKey_unique` UNIQUE(`metricKey`)
);
--> statement-breakpoint
CREATE TABLE `healthCheckins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`mood` enum('happy','neutral','sad') NOT NULL,
	`energyLevel` enum('High','Med','Low') NOT NULL,
	`notes` text,
	`checkinDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthCheckins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`insightType` enum('working','challenge','recommendation') NOT NULL,
	`content` text NOT NULL,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`generatedAt` timestamp NOT NULL,
	`validUntil` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthlyTargets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`targetValue` decimal(15,2) NOT NULL,
	`actualValue` decimal(15,2) DEFAULT '0',
	`weight` decimal(5,2),
	`rationale` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthlyTargets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`metricCategory` enum('revenue','pipeline','ventures','clients','finance','team','admin') NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`unit` varchar(50),
	`snapshotDate` timestamp NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelineCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stageId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`value` decimal(15,2),
	`currency` varchar(3) DEFAULT 'ZAR',
	`ownerId` int,
	`dueDate` timestamp,
	`tags` text,
	`metadata` text,
	`position` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`movedAt` timestamp,
	CONSTRAINT `pipelineCards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelineStages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pipelineType` enum('bd','ventures','studio','clients','finance','admin') NOT NULL,
	`name` varchar(100) NOT NULL,
	`order` int NOT NULL,
	`probabilityWeight` int DEFAULT 0,
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pipelineStages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`settingType` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `weeklyPriorities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','in-progress','done','blocked') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`linkedGoalId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weeklyPriorities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `currentHealthScore` int DEFAULT 75;--> statement-breakpoint
ALTER TABLE `users` ADD `currentEnergyLevel` enum('High','Med','Low') DEFAULT 'Med';