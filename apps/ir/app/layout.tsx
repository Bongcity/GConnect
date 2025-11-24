import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GConnect IR - 네이버 스마트스토어 구글 SEO 플랫폼',
  description: 'GConnect는 스마트스토어 판매자를 위한 구글 SEO 자동화 솔루션입니다. 개발 지식 없이, 상품 연동만으로 구글 검색 노출과 성과 분석을 제공합니다.',
  keywords: ['네이버 스마트스토어', '구글 SEO', 'SEO 자동화', '상품 노출', '마케팅 플랫폼'],
  authors: [{ name: 'GConnect' }],
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

