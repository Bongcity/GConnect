// ============================================
// API 응답 타입
// ============================================

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export interface ApiError {
  ok: false;
  error: string;
  errorCode?: string;
}

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

// ============================================
// IR 문의 타입
// ============================================

export type PlanIntent = 'STARTER' | 'PRO' | 'ENTERPRISE' | 'UNKNOWN';
export type InquiryType = 'ADOPTION' | 'PRICING' | 'TECH' | 'OTHER';

export interface IRInquiryFormData {
  storeName: string;
  email: string;
  phone?: string;
  planIntent?: PlanIntent;
  inquiryType: InquiryType;
  message: string;
  pageUrl?: string;
}

// ============================================
// 페이지네이션 타입
// ============================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

