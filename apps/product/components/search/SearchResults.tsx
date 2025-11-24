import { db } from '@gconnect/db';
import ProductCard from '../products/ProductCard';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchResultsProps {
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
  };
}

async function searchProducts(searchParams: SearchResultsProps['searchParams']) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  if (!query.trim()) {
    return { products: [], total: 0, totalPages: 0, currentPage: 1, query: '' };
  }

  // 정렬 옵션
  let orderBy: any = { createdAt: 'desc' };
  if (searchParams.sort === 'price_low') {
    orderBy = { price: 'asc' };
  } else if (searchParams.sort === 'price_high') {
    orderBy = { price: 'desc' };
  } else if (searchParams.sort === 'latest') {
    orderBy = { createdAt: 'desc' };
  }

  // 검색 조건
  const where: any = {
    isActive: true,
    isGoogleExposed: true,
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { category1: { contains: query } },
      { category2: { contains: query } },
      { category3: { contains: query } },
    ],
  };

  try {
    const [products, total] = await Promise.all([
      db.product.findMany({
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
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return { products, total, totalPages, currentPage: page, query };
  } catch (error) {
    console.error('Failed to search products:', error);
    return { products: [], total: 0, totalPages: 0, currentPage: 1, query };
  }
}

export default async function SearchResults({ searchParams }: SearchResultsProps) {
  const { products, total, totalPages, currentPage, query } = await searchProducts(searchParams);

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
  ];

  const currentSort = searchParams.sort || 'latest';

  return (
    <div className="container-custom">
      {/* 검색 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MagnifyingGlassIcon className="w-8 h-8 text-brand-neon" />
          <h1 className="text-4xl font-bold">
            {query ? (
              <>
                '<span className="gradient-text">{query}</span>' 검색 결과
              </>
            ) : (
              '상품 검색'
            )}
          </h1>
        </div>
        {query && (
          <p className="text-white/60">
            {total > 0 ? `${total}개의 상품을 찾았습니다` : '검색 결과가 없습니다'}
          </p>
        )}
      </div>

      {!query ? (
        // 검색어 없음
        <div className="glass-card p-12 text-center">
          <MagnifyingGlassIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            검색어를 입력하세요
          </h3>
          <p className="text-white/60">
            상단 검색바에서 원하는 상품을 검색해보세요
          </p>
        </div>
      ) : products.length === 0 ? (
        // 검색 결과 없음
        <div className="glass-card p-12 text-center">
          <p className="text-white/60 text-lg mb-4">
            '{query}'에 대한 검색 결과가 없습니다
          </p>
          <p className="text-white/40 text-sm mb-6">
            다른 검색어로 시도해보세요
          </p>
          <Link href="/products" className="btn-primary inline-block">
            전체 상품 보기
          </Link>
        </div>
      ) : (
        <>
          {/* 정렬 옵션 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/search?q=${encodeURIComponent(query)}&sort=${option.value}`}
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
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}${
                    searchParams.sort ? `&sort=${searchParams.sort}` : ''
                  }`}
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
                    href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}${
                      searchParams.sort ? `&sort=${searchParams.sort}` : ''
                    }`}
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
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}${
                    searchParams.sort ? `&sort=${searchParams.sort}` : ''
                  }`}
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

