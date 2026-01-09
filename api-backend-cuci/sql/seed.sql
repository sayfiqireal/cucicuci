USE `laundry_service`;

-- Users
INSERT INTO `User` (`id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin Cuci', 'admin@laundry.com', '$2b$10$vLWnCw2W9Nd21lvMLQ1ZP.J0AH3WSlovjXjtTm1UnDXDLunjjfO6O', 'admin', NOW(), NOW()),
(2, 'Budi', 'budi@example.com', '$2b$10$mwXHxCKDSyHkrWRvyXbmgO8jclvRu6b8p0.6JMzh.oTVj3eM04BSK', 'user', NOW(), NOW()),
(3, 'Sari', 'sari@example.com', '$2b$10$mwXHxCKDSyHkrWRvyXbmgO8jclvRu6b8p0.6JMzh.oTVj3eM04BSK', 'user', NOW(), NOW()),
(4, 'Andi', 'andi@example.com', '$2b$10$mwXHxCKDSyHkrWRvyXbmgO8jclvRu6b8p0.6JMzh.oTVj3eM04BSK', 'user', NOW(), NOW());

-- Services
INSERT INTO `Service` (`id`, `name`, `type`, `price`, `durationEstimate`, `createdAt`, `updatedAt`) VALUES
(1, 'Cuci Mobil Standard', 'mobil', 80000, 60, NOW(), NOW()),
(2, 'Cuci Mobil Premium', 'mobil', 120000, 80, NOW(), NOW()),
(3, 'Cuci Motor Reguler', 'motor', 30000, 30, NOW(), NOW()),
(4, 'Cuci Motor Detailing', 'motor', 60000, 50, NOW(), NOW()),
(5, 'Cuci Karpet Vacuum', 'karpet', 90000, 70, NOW(), NOW()),
(6, 'Cuci Karpet Deep Clean', 'karpet', 150000, 120, NOW(), NOW());

-- Orders
INSERT INTO `Order` (`id`, `userId`, `serviceType`, `serviceId`, `vehicleDetails`, `scheduledAt`, `status`, `price`, `notes`, `createdAt`, `updatedAt`, `completedAt`) VALUES
(1, 2, 'mobil', 1, JSON_OBJECT('plat','B1234CD','warna','Hitam'), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'queued', 80000, 'Perlu ekstra vacuum', NOW(), NOW(), NULL),
(2, 2, 'motor', 3, JSON_OBJECT('plat','B5566EF','warna','Merah'), NULL, 'in_progress', 30000, NULL, NOW(), NOW(), NULL),
(3, 3, 'mobil', 2, JSON_OBJECT('plat','B7788GH','warna','Putih'), DATE_ADD(NOW(), INTERVAL -3 DAY), 'completed', 120000, 'Ada noda aspal di pintu', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL -3 DAY)),
(4, 3, 'karpet', 6, JSON_OBJECT('ukuran','3x4'), NULL, 'queued', 150000, NULL, NOW(), NOW(), NULL),
(5, 4, 'motor', 4, JSON_OBJECT('plat','B9900IJ','warna','Hitam'), DATE_ADD(NOW(), INTERVAL -15 DAY), 'completed', 60000, NULL, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL -15 DAY)),
(6, 4, 'karpet', 5, JSON_OBJECT('ukuran','2x3'), NULL, 'cancelled', 90000, NULL, NOW(), NOW(), NULL),
(7, 2, 'mobil', 2, JSON_OBJECT('plat','B3322KL','warna','Silver'), NULL, 'pending', 120000, NULL, NOW(), NOW(), NULL),
(8, 3, 'motor', 3, JSON_OBJECT('plat','B6655MN','warna','Hitam'), NULL, 'queued', 30000, NULL, NOW(), NOW(), NULL),
(9, 3, 'mobil', 1, JSON_OBJECT('plat','B8899OP','warna','Biru'), DATE_ADD(NOW(), INTERVAL -1 DAY), 'completed', 80000, NULL, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL -1 DAY)),
(10, 4, 'karpet', 5, JSON_OBJECT('ukuran','2x3'), NULL, 'queued', 90000, NULL, NOW(), NOW(), NULL);

-- Queue positions
INSERT INTO `QueuePosition` (`orderId`, `position`, `createdAt`) VALUES
(1, 1, NOW()), -- mobil
(2, 1, NOW()), -- motor
(8, 2, NOW()), -- motor
(4, 1, NOW()), -- karpet
(10, 2, NOW()); -- karpet

-- Payments
INSERT INTO `Payment` (`orderId`, `amount`, `method`, `status`, `paidAt`, `createdAt`) VALUES
(3, 120000, 'cash', 'paid', DATE_ADD(NOW(), INTERVAL -3 DAY), NOW()),
(5, 60000, 'cash', 'paid', DATE_ADD(NOW(), INTERVAL -15 DAY), NOW()),
(9, 80000, 'cash', 'paid', DATE_ADD(NOW(), INTERVAL -1 DAY), NOW());
