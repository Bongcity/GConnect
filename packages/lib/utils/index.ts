/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param amount - 금액
 * @returns 포맷팅된 문자열 (예: "300,000원")
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 포맷팅된 문자열 (예: "2024년 1월 1일")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 이메일 주소 유효성 검사
 * @param email - 이메일 주소
 * @returns 유효 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 한국 전화번호 유효성 검사
 * @param phone - 전화번호
 * @returns 유효 여부
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * 문자열을 URL 친화적인 슬러그로 변환
 * @param text - 변환할 텍스트
 * @returns 슬러그
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-가-힣]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 딜레이 유틸리티 (async/await용)
 * @param ms - 대기 시간 (밀리초)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 안전한 JSON 파싱
 * @param json - JSON 문자열
 * @param fallback - 파싱 실패 시 기본값
 * @returns 파싱된 객체 또는 기본값
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

