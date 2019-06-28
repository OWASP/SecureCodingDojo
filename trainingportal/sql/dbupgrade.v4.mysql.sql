CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The entry id',
  `userId` int(11) DEFAULT NULL COMMENT 'The user id that passed the challenge',
  `moduleId` varchar(255) DEFAULT NULL COMMENT 'The id of the training module',
  `timestamp` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) DEFAULT CHARSET=utf8;

UPDATE dbInfo SET version=4;
