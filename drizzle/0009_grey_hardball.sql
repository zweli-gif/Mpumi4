CREATE TABLE `weeklyActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activity` text NOT NULL,
	`dueDay` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
	`dependency` text,
	`accountabilityPartnerId` int,
	`monthlyGoalId` int,
	`status` enum('pending','done','delayed','deprioritised') NOT NULL DEFAULT 'pending',
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weeklyActivities_id` PRIMARY KEY(`id`)
);
