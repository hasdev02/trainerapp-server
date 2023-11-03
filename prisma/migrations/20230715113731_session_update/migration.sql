/*
  Warnings:

  - Added the required column `browser` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceModel` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceType` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceVender` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session` ADD COLUMN `browser` VARCHAR(191) NOT NULL,
    ADD COLUMN `deviceModel` VARCHAR(191) NOT NULL,
    ADD COLUMN `deviceType` VARCHAR(191) NOT NULL,
    ADD COLUMN `deviceVender` VARCHAR(191) NOT NULL,
    ADD COLUMN `os` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `subscriptionEnd` DATETIME(3) NOT NULL DEFAULT (NOW() + INTERVAL 1 YEAR);
