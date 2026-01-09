import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'Laundry Service',
  description: 'Frontend laundry service end-user dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          <Header />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
