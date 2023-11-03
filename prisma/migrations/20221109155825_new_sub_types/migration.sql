/*
  Warnings:

  - The values [CUSTOM] on the enum `User_subscription` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `subscription` ENUM('INACTIVE', 'STANDARD', 'ENTRENAMIENTO', 'DIETA', 'FULL') NOT NULL DEFAULT 'INACTIVE',
    MODIFY `subscriptionEnd` DATETIME(3) NOT NULL DEFAULT (NOW() + INTERVAL 1 YEAR);
