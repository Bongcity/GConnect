export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GConnect',
    description:
      '네이버 스마트스토어 상품을 구글 검색에 최적화하여 노출하는 SEO 자동화 플랫폼',
    url: 'https://ir.gconnect.kr',
    logo: 'https://ir.gconnect.kr/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@gconnect.kr',
    },
    sameAs: [
      'https://www.gconnect.kr',
      'https://seller.gconnect.kr',
      'https://admin.gconnect.kr',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter 플랜',
        price: '39000',
        priceCurrency: 'KRW',
        description: '상품 10개 이하 스마트스토어를 위한 기본 플랜',
      },
      {
        '@type': 'Offer',
        name: 'Pro 플랜',
        price: '59000',
        priceCurrency: 'KRW',
        description: '상품 50개 이하 스토어를 위한 프로 플랜',
      },
      {
        '@type': 'Offer',
        name: 'Enterprise 플랜',
        description: '상품 50개 초과 대규모 스토어 및 에이전시를 위한 커스텀 플랜',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

