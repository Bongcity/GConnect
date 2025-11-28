import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductList from '@/components/products/ProductList';

export const metadata = {
  title: '전체 상품 - GConnect',
  description: '네이버 스마트스토어의 다양한 상품을 찾아보세요',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding">
        <ProductList />
      </main>
      <Footer />
    </div>
  );
}

