-- AlterTable
ALTER TABLE `session` MODIFY `browser` VARCHAR(191) NULL,
    MODIFY `deviceModel` VARCHAR(191) NULL,
    MODIFY `deviceType` VARCHAR(191) NULL,
    MODIFY `os` VARCHAR(191) NULL,
    MODIFY `deviceVendor` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `subscriptionEnd` DATETIME(3) NOT NULL DEFAULT (NOW() + INTERVAL 1 YEAR);
