import type { Metadata } from 'next';
import './globals.css';
import AdminHeader from '../components/AdminHeader';
import AdminFooter from '../components/AdminFooter';
import Providers from '../components/Providers';
import AdminSidebar from '../components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Laundry Admin Panel',
  description: 'Dashboard admin untuk layanan laundry'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <AdminHeader />
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex gap-6 min-h-[calc(100vh-140px)]">
            <AdminSidebar />
            <main className="flex-1">{children}</main>
          </div>
          <AdminFooter />
        </Providers>
      </body>
    </html>
  );
}
