ALTER TABLE `users` DROP COLUMN `level`;

UPDATE dbInfo SET version=5;
