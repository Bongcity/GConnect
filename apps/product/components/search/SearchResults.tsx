'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '../products/ProductCard';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { UnifiedProduct } from '@/types/product';

interface SearchResultsProps {
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
  };
}

interface RelatedKeyword {
  keyword: string;
  rank: number | null;
  category: string | null;
}

interface SearchData {
  combined: UnifiedProduct[];
  sellerCount: number;
  globalCount: number;
  total: number;
  hasNextPage: boolean;
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const router = useRouter();
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const [searchInput, setSearchInput] = useState(query);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoCompleteKeywords, setAutoCompleteKeywords] = useState<RelatedKeyword[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  // 검색 데이터 및 관련 검색어 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 검색 결과 가져오기
        const searchResponse = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${page}&sort=${searchParams.sort || 'latest'}`
        );
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          setSearchData(data);
        }

        // 관련 검색어 가져오기
        const relatedResponse = await fetch(
          `/api/related-keywords?keyword=${encodeURIComponent(query)}&limit=8`
        );
        if (relatedResponse.ok) {
          const data = await relatedResponse.json();
          setRelatedKeywords(data.relatedKeywords || []);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page, searchParams.sort]);

  // 검색어 입력값 동기화
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // 자동완성 검색어 로드 (입력할 때마다)
  useEffect(() => {
    const fetchAutoComplete = async () => {
      if (!searchInput || searchInput.length < 2) {
        setAutoCompleteKeywords([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/autocomplete?keyword=${encodeURIComponent(searchInput)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setAutoCompleteKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error('자동완성 검색어 로딩 실패:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchAutoComplete();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  // 하위 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowAutoComplete(false);
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  // 자동완성 키워드 클릭
  const handleAutoCompleteClick = (keyword: string) => {
    setSearchInput(keyword);
    setShowAutoComplete(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // 관련 검색어 클릭 핸들러
  const handleRelatedKeywordClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  if (!query.trim()) {
    return (
      <div className="container-custom">
        <div className="glass-card p-12 text-center">
          <MagnifyingGlassIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            검색어를 입력하세요
          </h3>
          <p className="text-white/60">
            상단 검색바에서 원하는 상품을 검색해보세요
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">
          <div className="text-white/60">검색 중...</div>
        </div>
      </div>
    );
  }

  if (!searchData) {
    return null;
  }

  const { combined, sellerCount, globalCount, total } = searchData;
  const totalPages = searchData.hasNextPage ? page + 1 : page;

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
            '<span className="gradient-text">{query}</span>' 검색 결과
          </h1>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <p className="text-white/60">
            {total > 0 ? `총 ${total.toLocaleString()}개의 상품을 찾았습니다` : '검색 결과가 없습니다'}
          </p>
          {sellerCount > 0 && (
            <span className="px-3 py-1 bg-brand-neon/20 text-brand-neon text-sm font-semibold rounded-full">
              파트너 {sellerCount.toLocaleString()}개
            </span>
          )}
          {globalCount > 0 && (
            <span className="px-3 py-1 bg-white/10 text-white/80 text-sm font-medium rounded-full">
              네이버 {globalCount.toLocaleString()}개
            </span>
          )}
        </div>

        {/* 하위 검색창 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowAutoComplete(true)}
              onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
              placeholder="다른 상품 검색..."
              className="w-full px-6 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy font-bold rounded-full hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
            >
              검색
            </button>

            {/* 자동완성 드롭다운 */}
            {showAutoComplete && autoCompleteKeywords.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-brand-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-50">
                <div className="py-2">
                  {autoCompleteKeywords.map((kw, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAutoCompleteClick(kw.keyword)}
                      className="w-full px-6 py-3 text-left text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-white/40" />
                      <span className="flex-1">{kw.keyword}</span>
                      {kw.rank && kw.rank <= 10 && (
                        <span className="px-2 py-0.5 bg-brand-neon/20 text-brand-neon text-xs font-bold rounded">
                          #{kw.rank}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* 세분화 검색어 */}
        {relatedKeywords.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-base font-bold text-white">
                <span className="gradient-text">'{query}'</span> 더 세분화해서 검색
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-brand-cyan/30 to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {relatedKeywords.map((related, index) => (
                <button
                  key={index}
                  onClick={() => handleRelatedKeywordClick(related.keyword)}
                  className="group relative px-4 py-2.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-brand-neon/30 hover:to-brand-cyan/20 border border-white/20 hover:border-brand-neon rounded-full text-white hover:text-brand-neon font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-neon/30"
                >
                  <span className="relative z-10">{related.keyword}</span>
                  {related.rank && related.rank <= 10 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-brand-neon/20 text-brand-neon text-xs font-bold rounded">
                      #{related.rank}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {combined.length === 0 ? (
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
            {combined.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}${
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
                      page === pageNum
                        ? 'bg-brand-neon text-brand-navy font-bold'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {page < totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}${
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
