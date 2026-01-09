CREATE DATABASE IF NOT EXISTS `laundry_service` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `laundry_service`;

-- Users
CREATE TABLE IF NOT EXISTS `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services
CREATE TABLE IF NOT EXISTS `Service` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('mobil','motor','karpet') NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `durationEstimate` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE IF NOT EXISTS `Order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `serviceType` ENUM('mobil','motor','karpet') NOT NULL,
  `serviceId` INT DEFAULT NULL,
  `vehicleDetails` JSON DEFAULT NULL,
  `scheduledAt` DATETIME(3) DEFAULT NULL,
  `status` ENUM('pending','queued','in_progress','completed','cancelled') NOT NULL DEFAULT 'queued',
  `price` DECIMAL(10,2) NOT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_userId_idx` (`userId`),
  KEY `Order_status_idx` (`status`),
  KEY `Order_serviceType_idx` (`serviceType`),
  KEY `Order_createdAt_idx` (`createdAt`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Order_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE IF NOT EXISTS `Payment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `method` VARCHAR(191) NOT NULL,
  `status` ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `paidAt` DATETIME(3) DEFAULT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_orderId_key` (`orderId`),
  CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Queue
CREATE TABLE IF NOT EXISTS `QueuePosition` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `position` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `QueuePosition_orderId_key` (`orderId`),
  CONSTRAINT `QueuePosition_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens
CREATE TABLE IF NOT EXISTS `RefreshToken` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tokenHash` VARCHAR(191) NOT NULL,
  `userId` INT NOT NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `RefreshToken_userId_idx` (`userId`),
  CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
