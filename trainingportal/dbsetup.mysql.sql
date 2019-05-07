CREATE TABLE `challengeEntries` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The entry id',
  `userId` int(11) DEFAULT NULL COMMENT 'The user id that passed the challenge',
  `challengeId` varchar(255) DEFAULT NULL COMMENT 'The id of the challenge that was passed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8;
CREATE TABLE `teams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `ownerId` int(11) DEFAULT NULL COMMENT 'The userid of the person who created this team',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `ownerid_UNIQUE` (`ownerId`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'The user id',
  `accountId` varchar(255) NOT NULL COMMENT 'The user account name',
  `teamId` int(10) unsigned DEFAULT NULL COMMENT 'The id of the team the user belongs to',
  `level` int(10) DEFAULT NULL,
  `familyName` varchar(255) DEFAULT NULL,
  `givenName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `account_name_UNIQUE` (`accountId`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8;