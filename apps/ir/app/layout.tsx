import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GConnect IR - 네이버 스마트스토어 구글 SEO 플랫폼',
  description: 'GConnect는 스마트스토어 판매자를 위한 구글 SEO 자동화 솔루션입니다. 개발 지식 없이, 상품 연동만으로 구글 검색 노출과 성과 분석을 제공합니다.',
  keywords: ['네이버 스마트스토어', '구글 SEO', 'SEO 자동화', '상품 노출', '마케팅 플랫폼'],
  authors: [{ name: 'GConnect' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'GConnect IR - 네이버 스마트스토어 구글 SEO 플랫폼',
    description: '스마트스토어를 구글에 자동으로 연결하는 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="min-h-screen bg-gradient-brand">
        {children}
      </body>
    </html>
  );
}

