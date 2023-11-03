/*
  Warnings:

  - You are about to drop the column `deviceVender` on the `session` table. All the data in the column will be lost.
  - Added the required column `deviceVendor` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session` DROP COLUMN `deviceVender`,
    ADD COLUMN `deviceVendor` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `subscriptionEnd` DATETIME(3) NOT NULL DEFAULT (NOW() + INTERVAL 1 YEAR);
