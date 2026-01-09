# Laundry Service REST API (Fastify + Prisma)

Backend production-ready untuk layanan cuci/laundry (mobil, motor, karpet). Menyediakan autentikasi JWT, role `user` & `admin`, antrian, laporan revenue, Swagger UI, Docker, dan koleksi Postman.

## Tech Stack
- Node.js 18+, Fastify 5 (pino logger + CORS + rate limit)
- Prisma ORM (MySQL/MariaDB), migrasi & seed
- JWT (access 15m, refresh 7d), bcrypt hashing
- Zod untuk validasi request
- Jest + Supertest untuk test
- Swagger UI (`/docs`), Postman collection (`docs/postman_collection.json`)
- Docker + docker-compose (app + MySQL)

**Kenapa Fastify?** Performa tinggi, integrasi pino logger built-in, sistem plugin yang rapi (auth, prisma, cors, swagger), dan ekosistem middleware yang sudah matang.

## Struktur Utama
- `src/` aplikasi (routes, middleware, utils)
- `prisma/schema.prisma` + `prisma/migrations/`
- `prisma/seed.ts` (programmatic seed) dan `sql/schema.sql`, `sql/seed.sql` (HeidiSQL)
- `docs/openapi.yaml` (Swagger), `docs/postman_collection.json`
- `docker-compose.yml`, `Dockerfile`

## Persiapan Environment (Laragon + HeidiSQL)
1) Pastikan Node.js 18+ terpasang.  
2) Jalankan MySQL/MariaDB lewat Laragon.  
3) Buat database `laundry_service` lewat HeidiSQL (atau `CREATE DATABASE laundry_service;`).  
4) Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial DB Laragon (default `root` tanpa password) dan JWT secret.  
5) Install dependencies: `npm install`.  
6) Generate Prisma client: `npm run prisma:generate`.  
7) Terapkan skema ke DB: `npm run prisma:migrate` (membuat tabel sesuai schema).  
8) Seed data contoh: `npm run prisma:seed` (buat 1 admin, beberapa user, services, orders, payments).  
9) Jalankan dev server: `npm run dev` (default port 4000).  
   - Swagger UI: `http://localhost:4000/docs`  
   - Health check: `/health`

### Alternatif impor manual via HeidiSQL
- Import `sql/schema.sql` (membuat tabel).  
- Import `sql/seed.sql` (data contoh identik dengan Prisma seed).  

### Docker / docker-compose
- `docker-compose up -d` akan menjalankan MySQL + app.  
- Env default di compose menggunakan `DATABASE_URL=mysql://root:root@db:3306/laundry_service`. Sesuaikan secret JWT sebelum produksi.

## Konfigurasi Penting
- CORS origins diatur lewat env `CORS_ORIGINS` (default `http://localhost:3000,http://localhost:5173`) dan dibaca di `src/config/env.ts`.
- Rate limiting aktif secara global (lihat env `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`).
- New order status default: `queued` dan langsung diberi posisi antrian.
- Harga order diambil dari tabel `services`; fallback default map (`mobil: 60000`, `motor: 30000`, `karpet: 80000`).
- Queue ETA dijumlahkan dari `durationEstimate` layanan (atau default durasi per tipe).

## Data Model (MySQL/MariaDB)
- `users`: id, name, email (UNIQUE), passwordHash, role (`user`|`admin`).
- `services`: id, name, type (`mobil`|`motor`|`karpet`), price (DECIMAL 10,2), durationEstimate (menit).
- `orders`: id, userId, serviceType, serviceId?, vehicleDetails (JSON), scheduledAt, status (`pending`|`queued`|`in_progress`|`completed`|`cancelled`), price, notes (TEXT), completedAt.
- `payments`: id, orderId, amount, method, status (`pending`|`paid`|`failed`), paidAt.
- `queuePositions`: id, orderId (unique), position.
- `refreshTokens`: id, tokenHash, userId, isRevoked, expiresAt.

## Seed Accounts & Data
- Admin: `admin@laundry.com` / `admin123`
- Users: `budi@example.com`, `sari@example.com`, `andi@example.com` (password: `password123`)
- Services: mobil, motor, karpet (6 contoh layanan)
- Orders: 10 contoh dengan status beragam + payments untuk yang completed.

## Endpoint Ringkas
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- User Orders: `POST /orders`, `GET /orders`, `GET /orders/:id`
- Queue (user/admin): `GET /queue`, `GET /admin/queue`
- Admin Auth: `POST /admin/auth/login`, `POST /admin/auth/refresh`, `POST /admin/logout`
- Admin Data: `GET /admin/stats/counts`, `GET /admin/orders`, `GET /admin/orders/:id`, `POST /admin/orders/:id/update-status`, `GET /admin/revenue/month`
- Swagger UI: `/docs`

## Format Response
- Sukses:  
  ```json
  { "success": true, "data": { ... }, "pagination": { ... } }
  ```
- Error:  
  ```json
  { "success": false, "error": { "code": "VALIDATION_FAILED|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|INTERNAL_SERVER_ERROR", "message": "...", "details": { ...optional } } }
  ```
Pagination: gunakan query `page`, `limit`; respons menyertakan `pagination` (totalItems, totalPages, currentPage, limit). Filtering: `status`, `serviceType`, `from`, `to`. Sorting admin orders: `sort=createdAt&order=asc|desc`.

## Autentikasi & Keamanan
- JWT Bearer pada header `Authorization: Bearer <accessToken>`.
- Access token 15 menit, refresh token 7 hari (disimpan & bisa di-revoke).
- Password di-hash bcrypt (rounds configurable via `BCRYPT_SALT_ROUNDS`).
- Rate limit diaktifkan; gunakan HTTPS di produksi.

## Jalankan & Skrip
- `npm run dev` — development (hot reload via tsx)
- `npm run build` — compile TypeScript
- `npm start` — jalankan hasil build
- `npm run prisma:migrate` — apply migrasi dev
- `npm run prisma:deploy` — apply migrasi ke prod
- `npm run prisma:seed` — jalankan seed Prisma
- `npm test` / `npm test -- --coverage` — unit + integration test (butuh DB MySQL aktif & sudah dimigrasi)
- `npm run lint` / `npm run format`

## Testing
- Unit: logika antrian (ETA), perhitungan revenue bulan berjalan.
- Integration: register/login, create/list orders, admin list/detail orders.
- Siapkan DB test (mis. `laundry_service`) dan jalankan migrasi + seed sebelum `npm test`. Target coverage 80% untuk logic kritikal.

## Dokumentasi & Tooling
- Swagger: `docs/openapi.yaml` disajikan di `/docs`.
- Postman: `docs/postman_collection.json`.
- Koleksi SQL: `sql/schema.sql` & `sql/seed.sql` (kompatibel HeidiSQL/Laragon).

## Panduan Konsumsi API dari Frontend
- Set header `Authorization: Bearer <accessToken>` setelah login/refresh.
- Tangani pagination: baca field `pagination` dari response (`page`, `limit`, `totalItems`, `totalPages`).
- Tangani error: gunakan `error.code` untuk mapping UI (mis. `UNAUTHORIZED`, `VALIDATION_FAILED`), tampilkan `message`.
- Logout: kirim refreshToken ke `/auth/logout` atau `/admin/logout` (admin).

## Business Rules & Queue
- Order baru: status awal `queued`, langsung dapat posisi terakhir per `serviceType`.
- ETA: jumlah `durationEstimate` layanan pada antrian (fallback durasi default per tipe).
- Harga: dari tabel `services`, fallback default price map.
- Revenue bulanan: menjumlahkan `price` order berstatus `completed` dengan `completedAt` pada bulan berjalan.

## CORS
- Default origin: `http://localhost:3000`, `http://localhost:5173`.
- Ubah lewat env `CORS_ORIGINS` (comma separated). Implementasi: `src/config/env.ts` + `@fastify/cors`.

## Deploy Notes
- Pastikan env berikut diisi di staging/production: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN`, `PORT`, `CORS_ORIGINS`, `BCRYPT_SALT_ROUNDS`.
- Rekomendasi deploy: Docker (ECS/Kubernetes), Render, Railway, atau DigitalOcean App Platform. Jalankan `npm run prisma:deploy` + `npm run prisma:seed` (opsional) setelah DB siap.

## Contoh cURL
- Login:  
  ```bash
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"budi@example.com","password":"password123"}'
  ```
- Buat order:  
  ```bash
  curl -X POST http://localhost:4000/orders \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -d '{"serviceType":"mobil","scheduledAt":"2025-12-12T09:00:00Z","vehicleDetails":{"plat":"B1234CD"}}'
  ```
- Admin lihat revenue bulan ini:  
  ```bash
  curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:4000/admin/revenue/month
  ```
