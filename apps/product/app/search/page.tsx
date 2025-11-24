import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchResults from '@/components/search/SearchResults';

export const metadata = {
  title: '상품 검색 - GConnect',
  description: '원하는 상품을 검색하세요',
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; page?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding">
        <Suspense
          fallback={
            <div className="container-custom">
              <div className="text-center py-12">
                <div className="text-white/60">검색 중...</div>
              </div>
            </div>
          }
        >
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

