CREATE TABLE `strategicObjectives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`weight` int NOT NULL DEFAULT 20,
	`icon` varchar(50) DEFAULT 'Target',
	`color` varchar(50) DEFAULT 'text-blue-600',
	`bgColor` varchar(100) DEFAULT 'bg-blue-50 border-blue-200',
	`displayOrder` int NOT NULL DEFAULT 0,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategicObjectives_id` PRIMARY KEY(`id`)
);
