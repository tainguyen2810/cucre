-- CreateTable
CREATE TABLE `JobRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(50) NOT NULL,
    `ok` BOOLEAN NOT NULL,
    `summary` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobRun_job_createdAt_idx`(`job`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
