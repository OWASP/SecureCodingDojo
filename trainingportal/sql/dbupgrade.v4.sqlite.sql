CREATE TABLE badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  moduleId CHAR(255),
  timestamp CHAR(255)
);

UPDATE dbInfo SET version=4;
