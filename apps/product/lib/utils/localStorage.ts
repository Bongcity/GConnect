import type { UnifiedProduct } from '@/types/product';

const FAVORITES_KEY = 'gconnect_favorites';
const RECENT_KEY = 'gconnect_recent';
const MAX_RECENT_PRODUCTS = 20;

// SSR 호환성 체크
const isClient = typeof window !== 'undefined';

// 좋아요 상품 관리
export const favoriteStorage = {
  /**
   * 모든 좋아요 상품 조회
   */
  getAll(): UnifiedProduct[] {
    if (!isClient) return [];
    
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      if (!data) return [];
      
      const favorites = JSON.parse(data);
      return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
      console.error('[favoriteStorage] getAll 오류:', error);
      return [];
    }
  },

  /**
   * 좋아요 상품 추가
   */
  add(product: UnifiedProduct): void {
    if (!isClient) return;
    
    try {
      const favorites = this.getAll();
      
      // 이미 존재하면 추가하지 않음
      if (favorites.some(p => p.id === product.id)) {
        return;
      }
      
      favorites.push(product);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('[favoriteStorage] add 오류:', error);
    }
  },

  /**
   * 좋아요 상품 제거
   */
  remove(productId: string): void {
    if (!isClient) return;
    
    try {
      const favorites = this.getAll();
      const filtered = favorites.filter(p => p.id !== productId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[favoriteStorage] remove 오류:', error);
    }
  },

  /**
   * 좋아요 토글 (추가/제거)
   * @returns 토글 후 상태 (true: 좋아요, false: 좋아요 취소)
   */
  toggle(product: UnifiedProduct): boolean {
    if (!isClient) return false;
    
    try {
      const has = this.has(product.id);
      
      if (has) {
        this.remove(product.id);
        return false;
      } else {
        this.add(product);
        return true;
      }
    } catch (error) {
      console.error('[favoriteStorage] toggle 오류:', error);
      return false;
    }
  },

  /**
   * 좋아요 여부 확인
   */
  has(productId: string): boolean {
    if (!isClient) return false;
    
    try {
      const favorites = this.getAll();
      return favorites.some(p => p.id === productId);
    } catch (error) {
      console.error('[favoriteStorage] has 오류:', error);
      return false;
    }
  },

  /**
   * 좋아요 개수 조회
   */
  count(): number {
    if (!isClient) return 0;
    
    try {
      return this.getAll().length;
    } catch (error) {
      console.error('[favoriteStorage] count 오류:', error);
      return 0;
    }
  },
};

// 최근 본 상품 관리
export const recentStorage = {
  /**
   * 모든 최근 본 상품 조회 (최신순)
   */
  getAll(): UnifiedProduct[] {
    if (!isClient) return [];
    
    try {
      const data = localStorage.getItem(RECENT_KEY);
      if (!data) return [];
      
      const recent = JSON.parse(data);
      return Array.isArray(recent) ? recent : [];
    } catch (error) {
      console.error('[recentStorage] getAll 오류:', error);
      return [];
    }
  },

  /**
   * 최근 본 상품 추가 (중복 시 최상단으로 이동)
   */
  add(product: UnifiedProduct): void {
    if (!isClient) return;
    
    try {
      let recent = this.getAll();
      
      // 중복 제거 (같은 상품 재방문 시 최상단으로)
      recent = recent.filter(p => p.id !== product.id);
      
      // 최상단에 추가
      recent.unshift(product);
      
      // 최대 개수 제한
      if (recent.length > MAX_RECENT_PRODUCTS) {
        recent = recent.slice(0, MAX_RECENT_PRODUCTS);
      }
      
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('[recentStorage] add 오류:', error);
    }
  },

  /**
   * 모든 최근 본 상품 삭제
   */
  clear(): void {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (error) {
      console.error('[recentStorage] clear 오류:', error);
    }
  },

  /**
   * 최근 본 상품 개수 조회
   */
  count(): number {
    if (!isClient) return 0;
    
    try {
      return this.getAll().length;
    } catch (error) {
      console.error('[recentStorage] count 오류:', error);
      return 0;
    }
  },
};

