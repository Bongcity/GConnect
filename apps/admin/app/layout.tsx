import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GConnect Admin - 관리자 대시보드',
  description: 'GConnect 플랫폼 관리자 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/95 to-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

