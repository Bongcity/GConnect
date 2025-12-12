import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GConnect - 네이버 스마트스토어 상품 검색',
  description: '네이버 스마트스토어의 다양한 상품을 한눈에! GConnect에서 원하는 상품을 찾아보세요.',
  keywords: ['네이버 스마트스토어', '상품 검색', '온라인 쇼핑', 'GConnect'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'GConnect - 네이버 스마트스토어 상품 검색',
    description: '네이버 스마트스토어의 다양한 상품을 한눈에!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

