CREATE TABLE dbInfo (
  version INTEGER
);
INSERT INTO dbInfo (version) VALUES (3);

ALTER TABLE challengeEntries ADD timestamp CHAR(255);