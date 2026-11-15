-- CreateTable
CREATE TABLE `Platform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `logo` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `network` VARCHAR(50) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Platform_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `segment` ENUM('product', 'digital', 'travel', 'local') NOT NULL,
    `parentId` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_segment_sortOrder_idx`(`segment`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('product', 'digital', 'travel', 'local') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleSearch` VARCHAR(255) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `images` JSON NOT NULL,
    `price` INTEGER NOT NULL,
    `oldPrice` INTEGER NULL,
    `discountPercent` INTEGER NOT NULL DEFAULT 0,
    `affiliateUrl` VARCHAR(1000) NOT NULL,
    `destination` VARCHAR(120) NULL,
    `techPros` JSON NULL,
    `techCons` JSON NULL,
    `techVerdict` TEXT NULL,
    `status` ENUM('draft', 'pending', 'published', 'expired') NOT NULL DEFAULT 'draft',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `externalId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `platformId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,

    UNIQUE INDEX `Deal_slug_key`(`slug`),
    INDEX `Deal_status_type_publishedAt_idx`(`status`, `type`, `publishedAt`),
    INDEX `Deal_status_featured_idx`(`status`, `featured`),
    INDEX `Deal_categoryId_idx`(`categoryId`),
    INDEX `Deal_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `Deal_platformId_externalId_key`(`platformId`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dealId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PriceHistory_dealId_recordedAt_idx`(`dealId`, `recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(64) NULL,
    `title` VARCHAR(255) NOT NULL,
    `titleSearch` VARCHAR(255) NOT NULL,
    `conditions` TEXT NULL,
    `minOrder` INTEGER NULL,
    `maxDiscount` INTEGER NULL,
    `usedPercent` INTEGER NOT NULL DEFAULT 0,
    `url` VARCHAR(1000) NOT NULL,
    `status` ENUM('pending', 'published', 'expired') NOT NULL DEFAULT 'published',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `externalId` VARCHAR(191) NULL,
    `startsAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `platformId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,

    INDEX `Coupon_status_platformId_expiresAt_idx`(`status`, `platformId`, `expiresAt`),
    INDEX `Coupon_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `Coupon_platformId_externalId_key`(`platformId`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Place` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `nameSearch` VARCHAR(191) NOT NULL,
    `type` ENUM('restaurant', 'cafe', 'buffet', 'spa', 'massage', 'salon', 'other') NOT NULL,
    `description` TEXT NULL,
    `address` VARCHAR(255) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `districtSlug` VARCHAR(100) NOT NULL,
    `ward` VARCHAR(100) NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'TP. Hồ Chí Minh',
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `openingHours` VARCHAR(255) NULL,
    `images` JSON NOT NULL,
    `commissionPercent` DOUBLE NULL,
    `contact` VARCHAR(255) NULL,
    `status` ENUM('draft', 'published', 'paused') NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Place_slug_key`(`slug`),
    INDEX `Place_status_districtSlug_type_idx`(`status`, `districtSlug`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placeId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL,
    `oldPrice` INTEGER NULL,
    `conditions` TEXT NULL,
    `quantity` INTEGER NULL,
    `status` ENUM('draft', 'published', 'paused', 'expired') NOT NULL DEFAULT 'draft',
    `startsAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Voucher_placeId_status_idx`(`placeId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VoucherClaim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucherId` INTEGER NOT NULL,
    `fullName` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `status` ENUM('issued', 'used', 'cancelled') NOT NULL DEFAULT 'issued',
    `consentAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `ipHash` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VoucherClaim_code_key`(`code`),
    INDEX `VoucherClaim_phone_idx`(`phone`),
    INDEX `VoucherClaim_status_createdAt_idx`(`status`, `createdAt`),
    UNIQUE INDEX `VoucherClaim_voucherId_phone_key`(`voucherId`, `phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerLead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placeName` VARCHAR(191) NOT NULL,
    `placeType` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `contactName` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `email` VARCHAR(191) NULL,
    `proposedCommission` VARCHAR(50) NULL,
    `offer` TEXT NULL,
    `note` TEXT NULL,
    `status` ENUM('new', 'contacted', 'signed', 'rejected') NOT NULL DEFAULT 'new',
    `consentAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PartnerLead_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleSearch` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `excerpt` VARCHAR(500) NULL,
    `coverImage` VARCHAR(255) NULL,
    `content` LONGTEXT NOT NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SaleEvent_slug_key`(`slug`),
    INDEX `SaleEvent_startsAt_idx`(`startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Click` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dealId` INTEGER NULL,
    `couponId` INTEGER NULL,
    `platformId` INTEGER NULL,
    `referrer` VARCHAR(255) NULL,
    `userAgent` VARCHAR(255) NULL,
    `ipHash` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Click_createdAt_idx`(`createdAt`),
    INDEX `Click_dealId_createdAt_idx`(`dealId`, `createdAt`),
    INDEX `Click_couponId_createdAt_idx`(`couponId`, `createdAt`),
    INDEX `Click_platformId_createdAt_idx`(`platformId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostDeals` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PostDeals_AB_unique`(`A`, `B`),
    INDEX `_PostDeals_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DealCoupons` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DealCoupons_AB_unique`(`A`, `B`),
    INDEX `_DealCoupons_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deal` ADD CONSTRAINT `Deal_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deal` ADD CONSTRAINT `Deal_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_dealId_fkey` FOREIGN KEY (`dealId`) REFERENCES `Deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `Place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VoucherClaim` ADD CONSTRAINT `VoucherClaim_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_dealId_fkey` FOREIGN KEY (`dealId`) REFERENCES `Deal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostDeals` ADD CONSTRAINT `_PostDeals_A_fkey` FOREIGN KEY (`A`) REFERENCES `Deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostDeals` ADD CONSTRAINT `_PostDeals_B_fkey` FOREIGN KEY (`B`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DealCoupons` ADD CONSTRAINT `_DealCoupons_A_fkey` FOREIGN KEY (`A`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DealCoupons` ADD CONSTRAINT `_DealCoupons_B_fkey` FOREIGN KEY (`B`) REFERENCES `Deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
