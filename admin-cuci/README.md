# Laundry Admin Panel (Next.js 15)

Dashboard admin untuk layanan cuci (mobil/motor/karpet). Mengonsumsi REST API admin yang sudah tersedia.

## Tech Stack
- Next.js 15 (App Router) + React 19 RC
- TypeScript
- Tailwind CSS
- TanStack Query untuk fetching/mutations

## Setup
1) `npm install --legacy-peer-deps`
2) Buat `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ```
   Sesuaikan dengan host backend.
3) Dev server: `npm run dev` → buka `http://localhost:3000`.

## Halaman
- `/login` — login admin.
- `/` — dashboard (stats + tabel antrian).
- `/service-history` — tabel riwayat layanan (orders).
- `/queue` — tabel antrian.
- `/users` — daftar user.

## Auth & Proteksi
- Token admin disimpan di `localStorage` dengan key `admin_access_token`.
- Halaman selain `/login` dicek token via hook `useRequireAdmin`; jika belum login, redirect ke `/login`.
- Logout: tombol di header, menghapus token.

## Endpoint Backend yang digunakan (kontrak)
- `POST /admin/auth/login` → { accessToken, admin }
- `GET /admin/stats/summary` → { monthlyRevenue, currency, queueCount, usersCount }
- `GET /admin/queue`
- `GET /admin/orders?page=&limit=...`
- `GET /admin/users?page=&limit=&search=`
Jika backend belum ada, endpoint di atas perlu diimplementasikan konsisten dengan tipe pada `lib/adminApiClient.ts`.

## Struktur Singkat
- `app/layout.tsx` + `components/AdminHeader|AdminFooter` — layout global.
- `components/Providers.tsx` — QueryClientProvider + ThemeProvider + AuthProvider.
- `hooks/useAdminAuth.ts` — cek token + guard.
- `lib/adminApiClient.ts` — helper fetch admin API.
- `components/tables/*` — tabel queue, orders, users.
- `components/StatsCard.tsx` — kartu statistik dashboard.

## Styling
- Tailwind dengan mode `class` (dark mode toggle di header).

## Catatan
- Pastikan backend admin endpoint mengembalikan JSON sesuai kontrak di atas.
- Gunakan `--legacy-peer-deps` saat install karena kombinasi Next 15 + React 19 RC.
