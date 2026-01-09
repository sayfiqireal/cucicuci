# Laundry Service Frontend (Next.js 15)

Frontend end-user untuk layanan cuci (mobil/motor/karpet) yang mengonsumsi REST API backend (sudah tersedia). Dibangun dengan Next.js 15 (App Router), TypeScript, Tailwind CSS, dan TanStack Query.

## Tech Stack
- Next.js 15 (App Router) + React 19 RC
- TypeScript
- Tailwind CSS 3
- TanStack Query (fetching & mutations)

## Struktur Utama
- `app/` — halaman (`/`, `/login`, `/register`, `/dashboard`) + layout.
- `components/` — Header, Footer, Hero, OrderCard, QueueButton, modal Order/Queue, Providers.
- `lib/apiClient.ts` — helper request ke backend (pakai `NEXT_PUBLIC_API_BASE_URL`).
- `hooks/useRequireAuth.ts` — proteksi dashboard.
- `types/` — tipe user, order, queue.

## Setup & Running
1) Install deps: `npm install --legacy-peer-deps` (dibutuhkan karena React 19 RC).
2) Buat `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ```
   Sesuaikan port dengan backend.
3) Jalankan dev server: `npm run dev` lalu buka `http://localhost:3000`.

## Flow Auth
- Login/Register memanggil backend `/auth/login` atau `/auth/register`.
- Respons `accessToken` disimpan di `localStorage`, user info disimpan di context.
- Header menampilkan link sesuai status login.
- Dashboard memakai `useRequireAuth` untuk redirect ke `/login` jika tidak ada token.

## Dashboard
- Hero section dengan deskripsi.
- Card “Pesan Cuci” → modal form:
  - serviceType (mobil/motor/karpet), scheduledAt (opsional), vehicleDetails (plat/merk/warna), catatan.
  - Submit memanggil `POST /orders` (Bearer token).
- Tombol “Lihat Antrian Sekarang” → modal queue:
  - Fetch `GET /queue`, tampilkan posisi/jenis/ETA.

## Styling
- Tailwind utilities (mobile-first).
- Komponen header/footer reusable lewat `app/layout.tsx`.

## Data Fetching
- TanStack Query Provider di `components/Providers.tsx`.
- `useMutation` untuk login/register/order, `useQuery` untuk queue (aktif saat modal terbuka).

## Catatan
- Token hanya disimpan di `localStorage` (akses dari client components).
- Sesuaikan `NEXT_PUBLIC_API_BASE_URL` agar mengarah ke backend laundry yang sudah ada.
