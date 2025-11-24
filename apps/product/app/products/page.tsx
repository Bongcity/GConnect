import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductList from '@/components/products/ProductList';

export const metadata = {
  title: '전체 상품 - GConnect',
  description: '네이버 스마트스토어의 다양한 상품을 찾아보세요',
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { sort?: string; category?: string; page?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding">
        <Suspense
          fallback={
            <div className="container-custom">
              <div className="text-center py-12">
                <div className="text-white/60">로딩 중...</div>
              </div>
            </div>
          }
        >
          <ProductList searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

