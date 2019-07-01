CREATE TABLE dbInfo (
  version INTEGER
);
INSERT INTO dbInfo (version) VALUES (5);

CREATE TABLE challengeEntries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  challengeId CHAR(255),
  timestamp CHAR(255)
);

CREATE TABLE badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  moduleId CHAR(255),
  timestamp CHAR(255)
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name CHAR(255) UNIQUE,
  description CHAR(2048),
  ownerId INTEGER UNIQUE
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountId CHAR(255) NOT NULL UNIQUE,
  teamId INTEGER unsigned,
  familyName CHAR(255),
  givenName CHAR(255)
);

