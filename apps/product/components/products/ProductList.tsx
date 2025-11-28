'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { UnifiedProduct } from '@/types/product';

interface CategoryItem {
  name: string;
  cid?: string;
  productCount: number;
}

interface KeywordItem {
  keyword: string;
  rank: number | null;
  category: string | null;
}

interface ProductData {
  combined: UnifiedProduct[];
  sellerProducts: UnifiedProduct[];
  globalProducts: UnifiedProduct[];
  total: {
    seller: number;
    global: number;
    combined: number;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category');
  const currentSort = searchParams.get('sort') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentKeyword = searchParams.get('keyword');

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('전체 상품');
  
  // 카테고리 계층 상태
  const [category1List, setCategory1List] = useState<CategoryItem[]>([]);
  const [category2List, setCategory2List] = useState<CategoryItem[]>([]);
  const [category3List, setCategory3List] = useState<CategoryItem[]>([]);
  const [selectedCategory1, setSelectedCategory1] = useState('');
  const [selectedCategory2, setSelectedCategory2] = useState('');
  const [selectedCategory3, setSelectedCategory3] = useState('');
  const [showCategory1, setShowCategory1] = useState(false);
  const [showCategory2, setShowCategory2] = useState(false);
  const [showCategory3, setShowCategory3] = useState(false);
  
  // 인기 키워드
  const [popularKeywords, setPopularKeywords] = useState<KeywordItem[]>([]);
  
  // 카테고리 내 검색어
  const [categorySearch, setCategorySearch] = useState(currentKeyword || '');

  // 1단계 카테고리 로드
  useEffect(() => {
    const fetchCategory1 = async () => {
      try {
        const response = await fetch('/api/category-hierarchy');
        if (response.ok) {
          const data = await response.json();
          setCategory1List(data.categories || []);
        }
      } catch (error) {
        console.error('1단계 카테고리 로딩 실패:', error);
      }
    };
    fetchCategory1();
  }, []);

  // 2단계 카테고리 로드
  useEffect(() => {
    if (!selectedCategory1) {
      setCategory2List([]);
      setSelectedCategory2('');
      return;
    }

    const fetchCategory2 = async () => {
      try {
        const response = await fetch(`/api/category-hierarchy?category1=${encodeURIComponent(selectedCategory1)}`);
        if (response.ok) {
          const data = await response.json();
          setCategory2List(data.categories || []);
        }
      } catch (error) {
        console.error('2단계 카테고리 로딩 실패:', error);
      }
    };
    fetchCategory2();
  }, [selectedCategory1]);

  // 3단계 카테고리 로드
  useEffect(() => {
    if (!selectedCategory1 || !selectedCategory2) {
      setCategory3List([]);
      setSelectedCategory3('');
      return;
    }

    const fetchCategory3 = async () => {
      try {
        const response = await fetch(
          `/api/category-hierarchy?category1=${encodeURIComponent(selectedCategory1)}&category2=${encodeURIComponent(selectedCategory2)}`
        );
        if (response.ok) {
          const data = await response.json();
          setCategory3List(data.categories || []);
        }
      } catch (error) {
        console.error('3단계 카테고리 로딩 실패:', error);
      }
    };
    fetchCategory3();
  }, [selectedCategory1, selectedCategory2]);

  // 인기 키워드 로드
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const params = new URLSearchParams();
        
        // cid가 있으면 cid로 조회 (우선순위 1)
        if (currentCategory) {
          params.append('cid', currentCategory);
        }
        
        // 카테고리명도 함께 전달 (fallback용)
        if (selectedCategory1) params.append('category1', selectedCategory1);
        if (selectedCategory2) params.append('category2', selectedCategory2);
        if (selectedCategory3) params.append('category3', selectedCategory3);
        params.append('limit', '15');

        const response = await fetch(`/api/category-keywords?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setPopularKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error('인기 키워드 로딩 실패:', error);
      }
    };

    fetchKeywords();
  }, [currentCategory, selectedCategory1, selectedCategory2, selectedCategory3]);

  // URL의 category에서 카테고리명 조회 및 1단계 선택 상태 업데이트
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!currentCategory) {
        setCategoryName('전체 상품');
        setSelectedCategory1('');
        return;
      }

      try {
        // cid로 카테고리 정보 조회
        const response = await fetch(`/api/category-info?cid=${currentCategory}`);
        if (response.ok) {
          const data = await response.json();
          if (data.category_1) {
            setSelectedCategory1(data.category_1);
            setCategoryName(data.category_1);
            
            // 2단계, 3단계도 있으면 설정
            if (data.category_2) {
              setSelectedCategory2(data.category_2);
            }
            if (data.category_3) {
              setSelectedCategory3(data.category_3);
            }
          }
        }
      } catch (error) {
        console.error('카테고리 정보 조회 실패:', error);
      }
    };

    fetchCategoryInfo();
  }, [currentCategory]);

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCategory) params.append('category', currentCategory);
        if (currentKeyword) params.append('keyword', currentKeyword);
        params.append('sort', currentSort);
        params.append('page', currentPage.toString());
        params.append('pageSize', '20');

        const response = await fetch(`/api/products-list?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProductData(data);
        }
      } catch (error) {
        console.error('상품 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentKeyword, currentSort, currentPage]);

  // 카테고리 검색 핸들러
  const handleCategorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (categorySearch.trim()) {
      const params = new URLSearchParams();
      params.append('keyword', categorySearch);
      if (currentCategory) params.append('category', currentCategory);
      router.push(`/products?${params.toString()}`);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (cid: string) => {
    router.push(`/products?category=${cid}`);
  };

  // 키워드 클릭 핸들러 (카테고리 페이지에서는 같은 페이지에서 필터링)
  const handleKeywordClick = (keyword: string) => {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    if (currentCategory) {
      params.append('category', currentCategory);
    }
    router.push(`/products?${params.toString()}`);
  };

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
  ];

  if (loading || !productData) {
    return (
      <div className="container-custom">
        <div className="text-center py-12">
          <div className="text-white/60">로딩 중...</div>
        </div>
      </div>
    );
  }

  const { combined, total, pagination } = productData;
  const sellerCount = productData.sellerProducts.length;
  const globalCount = productData.globalProducts.length;

  return (
    <div className="container-custom">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {currentCategory ? (
            <span className="gradient-text">{categoryName}</span>
          ) : (
            '전체 상품'
          )}
        </h1>
        <div className="flex items-center gap-4 text-white/60 mb-3">
          <p>총 {total.combined.toLocaleString()}개의 상품</p>
          {sellerCount > 0 && (
            <span className="px-3 py-1 bg-brand-neon/20 text-brand-neon text-sm font-semibold rounded-full">
              파트너 {total.seller.toLocaleString()}개
            </span>
          )}
          {globalCount > 0 && (
            <span className="px-3 py-1 bg-white/10 text-white/80 text-sm font-medium rounded-full">
              네이버 {total.global.toLocaleString()}개
            </span>
          )}
        </div>
        {/* 키워드 필터 표시 */}
        {currentKeyword && (
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">검색어:</span>
            <span className="px-3 py-1 bg-brand-cyan/20 text-brand-cyan text-sm font-semibold rounded-full">
              {currentKeyword}
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (currentCategory) params.append('category', currentCategory);
                router.push(`/products?${params.toString()}`);
              }}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 카테고리 필터 & 검색 */}
      <div className="glass-card p-6 mb-8">
        {/* 카테고리 드롭다운 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowCategory1(!showCategory1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[200px] justify-between"
            >
              <span>{selectedCategory1 || '1단계 카테고리'}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {selectedCategory1 && (
              <button
                onClick={() => setShowCategory2(!showCategory2)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[200px] justify-between"
              >
                <span>{selectedCategory2 || '2단계 카테고리'}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            )}

            {selectedCategory2 && (
              <button
                onClick={() => setShowCategory3(!showCategory3)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[200px] justify-between"
              >
                <span>{selectedCategory3 || '3단계 카테고리'}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 1단계 드롭다운 목록 */}
          {showCategory1 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                {category1List.map((cat) => (
                  <button
                    key={cat.cid || cat.name}
                    onClick={() => {
                      setSelectedCategory1(cat.name);
                      setShowCategory1(false);
                      setSelectedCategory2('');
                      setSelectedCategory3('');
                      // 1단계 선택 시에도 상품 필터링 적용
                      if (cat.cid) {
                        handleCategorySelect(cat.cid);
                      }
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-brand-neon/20 rounded-lg text-left text-white/80 hover:text-brand-neon text-sm transition-colors"
                  >
                    {cat.name}
                    <span className="text-xs text-white/40 ml-2">({cat.productCount.toLocaleString()})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2단계 드롭다운 목록 */}
          {showCategory2 && category2List.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                {category2List.map((cat) => (
                  <button
                    key={cat.cid || cat.name}
                    onClick={() => {
                      setSelectedCategory2(cat.name);
                      setShowCategory2(false);
                      setSelectedCategory3('');
                      // 2단계 선택 시에도 상품 필터링 적용
                      if (cat.cid) {
                        handleCategorySelect(cat.cid);
                      }
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-brand-neon/20 rounded-lg text-left text-white/80 hover:text-brand-neon text-sm transition-colors"
                  >
                    {cat.name}
                    <span className="text-xs text-white/40 ml-2">({cat.productCount.toLocaleString()})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3단계 드롭다운 목록 */}
          {showCategory3 && category3List.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                {category3List.map((cat) => (
                  <button
                    key={cat.cid}
                    onClick={() => {
                      setSelectedCategory3(cat.name);
                      setShowCategory3(false);
                      handleCategorySelect(cat.cid!);
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-brand-neon/20 rounded-lg text-left text-white/80 hover:text-brand-neon text-sm transition-colors"
                  >
                    {cat.name}
                    <span className="text-xs text-white/40 ml-2">({cat.productCount.toLocaleString()})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 카테고리 내 상품 검색 */}
        <form onSubmit={handleCategorySearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="카테고리 내 상품 검색..."
              className="w-full px-6 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy font-bold rounded-lg hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
            >
              검색
            </button>
          </div>
        </form>

        {/* 인기 키워드 */}
        {popularKeywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-base font-bold text-white">인기 키워드</div>
              <div className="h-px flex-1 bg-gradient-to-r from-brand-neon/30 to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {popularKeywords.map((kw, index) => (
                <button
                  key={index}
                  onClick={() => handleKeywordClick(kw.keyword)}
                  className={`group relative px-4 py-2.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-brand-neon/30 hover:to-brand-cyan/20 border hover:border-brand-neon rounded-full hover:text-brand-neon font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-neon/30 ${
                    currentKeyword === kw.keyword
                      ? 'border-brand-neon text-brand-neon bg-brand-neon/10'
                      : 'border-white/20 text-white'
                  }`}
                >
                  <span className="relative z-10">{kw.keyword}</span>
                  {kw.rank && kw.rank <= 10 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-brand-neon/20 text-brand-neon text-xs font-bold rounded">
                      #{kw.rank}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 정렬 옵션 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={`/products?sort=${option.value}${
                currentCategory ? `&category=${currentCategory}` : ''
              }${currentKeyword ? `&keyword=${currentKeyword}` : ''}`}
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
      {combined.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/60 text-lg mb-4">상품이 없습니다.</p>
          {currentCategory && (
            <Link
              href="/products"
              className="text-brand-neon hover:text-brand-cyan transition-colors"
            >
              전체 상품 보기 →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {combined.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/products?page=${currentPage - 1}${
                    currentSort ? `&sort=${currentSort}` : ''
                  }${currentCategory ? `&category=${currentCategory}` : ''}${
                    currentKeyword ? `&keyword=${currentKeyword}` : ''
                  }`}
                  className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  이전
                </Link>
              )}

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Link
                    key={pageNum}
                    href={`/products?page=${pageNum}${
                      currentSort ? `&sort=${currentSort}` : ''
                    }${currentCategory ? `&category=${currentCategory}` : ''}${
                      currentKeyword ? `&keyword=${currentKeyword}` : ''
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

              {currentPage < pagination.totalPages && (
                <Link
                  href={`/products?page=${currentPage + 1}${
                    currentSort ? `&sort=${currentSort}` : ''
                  }${currentCategory ? `&category=${currentCategory}` : ''}${
                    currentKeyword ? `&keyword=${currentKeyword}` : ''
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
