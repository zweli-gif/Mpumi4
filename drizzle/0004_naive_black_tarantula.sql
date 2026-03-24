CREATE TABLE `ceoReflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceoReflections_id` PRIMARY KEY(`id`)
);
