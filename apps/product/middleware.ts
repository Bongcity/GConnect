import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 이전 URL 형식 감지: /products/SELLER_123 또는 /products/GLOBAL_456
  const oldUrlPattern = /^\/products\/(SELLER_|GLOBAL_)(\d+)$/;
  const match = pathname.match(oldUrlPattern);

  if (match) {
    // 상품 타입과 ID 추출
    const prefix = match[1]; // "SELLER_" 또는 "GLOBAL_"
    const numericId = match[2]; // 숫자 ID
    const type = prefix.replace('_', ''); // "SELLER" 또는 "GLOBAL"

    // 새 URL로 리다이렉트 (slug는 임시로 "product" 사용, 실제 페이지에서 올바른 slug로 리다이렉트)
    const newUrl = new URL(`/products/${type}/${numericId}/product`, request.url);
    
    // Permanent redirect (301) - SEO에 유리
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/products/:path*',
};




