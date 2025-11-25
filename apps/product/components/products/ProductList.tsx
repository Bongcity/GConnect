import { prisma } from '@gconnect/db';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface ProductListProps {
  searchParams: {
    sort?: string;
    category?: string;
    page?: string;
  };
}

async function getProducts(searchParams: ProductListProps['searchParams']) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // 정렬 옵션
  let orderBy: any = { createdAt: 'desc' };
  if (searchParams.sort === 'price_low') {
    orderBy = { price: 'asc' };
  } else if (searchParams.sort === 'price_high') {
    orderBy = { price: 'desc' };
  } else if (searchParams.sort === 'latest') {
    orderBy = { createdAt: 'desc' };
  }

  // 필터 조건
  const where: any = {
    isActive: true,
    isGoogleExposed: true,
  };

  if (searchParams.category) {
    where.category1 = searchParams.category;
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              shopName: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return { products, total, totalPages, currentPage: page };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { products: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

export default async function ProductList({ searchParams }: ProductListProps) {
  const { products, total, totalPages, currentPage } = await getProducts(searchParams);

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
  ];

  const currentSort = searchParams.sort || 'latest';

  return (
    <div className="container-custom">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">전체 상품</h1>
        <p className="text-white/60">총 {total}개의 상품</p>
      </div>

      {/* 필터 & 정렬 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={`/products?sort=${option.value}${
                searchParams.category ? `&category=${searchParams.category}` : ''
              }`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSort === option.value
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      {products.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/60 text-lg">상품이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/products?page=${currentPage - 1}${
                    searchParams.sort ? `&sort=${searchParams.sort}` : ''
                  }${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  이전
                </Link>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Link
                    key={pageNum}
                    href={`/products?page=${pageNum}${
                      searchParams.sort ? `&sort=${searchParams.sort}` : ''
                    }${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-brand-neon text-brand-navy font-bold'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={`/products?page=${currentPage + 1}${
                    searchParams.sort ? `&sort=${searchParams.sort}` : ''
                  }${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  다음
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

