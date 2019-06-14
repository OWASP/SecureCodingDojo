CREATE TABLE `dbInfo` (
  `version` INT NULL
);
INSERT INTO `dbInfo` (`version`) VALUES (3);

ALTER TABLE `challengeEntries` ADD COLUMN `timestamp` varchar(255) NULL AFTER `challengeId`;

