import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import InquiryButton from '@/components/InquiryButton';
import {
  LinkIcon,
  Square3Stack3DIcon,
  CogIcon,
  MagnifyingGlassCircleIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: '동작 방식 - GConnect IR',
  description:
    'GConnect가 네이버 스마트스토어 상품을 구글 검색에 최적화하는 과정을 자세히 알아보세요.',
};

const detailedSteps = [
  {
    number: '01',
    title: '스마트스토어 연결',
    icon: LinkIcon,
    color: 'from-blue-500 to-cyan-500',
    details: [
      {
        subtitle: '인증 및 연결',
        content:
          '스토어 ID/인증키 또는 API 키로 간단하게 연결합니다. 한 번만 설정하면 자동으로 동기화됩니다.',
      },
      {
        subtitle: '자동 동기화',
        content:
          '설정된 주기(예: 1시간, 1일)에 따라 자동으로 상품 정보를 업데이트합니다. 네이버에서만 상품을 관리하면 됩니다.',
      },
      {
        subtitle: '실시간 모니터링',
        content:
          '연동 상태를 실시간으로 모니터링하며, 문제 발생 시 즉시 알림을 보냅니다.',
      },
    ],
  },
  {
    number: '02',
    title: '데이터 정규화 & 카테고리 매핑',
    icon: Square3Stack3DIcon,
    color: 'from-purple-500 to-pink-500',
    details: [
      {
        subtitle: '카테고리 구조화',
        content:
          '네이버 카테고리를 GConnect 내부 카테고리 구조로 자동 매핑하여 검색 효율을 높입니다.',
      },
      {
        subtitle: '옵션/가격/재고 관리',
        content:
          '상품 옵션, 가격, 재고 정보를 실시간으로 업데이트하고 정규화하여 저장합니다.',
      },
      {
        subtitle: '품질 검증',
        content:
          '중복 상품 처리 및 품절/삭제 정책을 자동으로 적용하여 검색 품질을 유지합니다.',
      },
    ],
  },
  {
    number: '03',
    title: 'SEO 구조 생성',
    icon: CogIcon,
    color: 'from-brand-neon to-brand-cyan',
    details: [
      {
        subtitle: 'SEO 친화적 URL',
        content:
          '상품별로 의미있는 URL을 자동 생성합니다. 예: /products/카테고리/상품명-상품ID',
      },
      {
        subtitle: '메타 태그 최적화',
        content:
          '상품명, 카테고리, 가격 정보를 바탕으로 title, description, keywords를 자동 생성합니다.',
      },
      {
        subtitle: '구조화된 데이터',
        content:
          'schema.org/Product 기반 JSON-LD를 삽입하여 구글이 상품 정보를 정확하게 이해하도록 합니다.',
      },
    ],
  },
  {
    number: '04',
    title: '구글 제출 & 성과 모니터링',
    icon: MagnifyingGlassCircleIcon,
    color: 'from-orange-500 to-red-500',
    details: [
      {
        subtitle: 'Sitemap 제출',
        content:
          'XML Sitemap을 자동으로 생성하고 구글 Search Console에 제출하여 빠른 인덱싱을 유도합니다.',
      },
      {
        subtitle: '인덱싱 상태 체크',
        content:
          '각 상품 페이지의 인덱싱 상태를 모니터링하고, 문제 발생 시 재제출합니다.',
      },
      {
        subtitle: '성과 분석',
        content:
          '구글 검색 노출, 클릭, CTR 데이터를 수집하여 상점 관리자 화면에서 확인할 수 있습니다.',
      },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <MainLayout>
      {/* 히어로 */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight">
            GConnect는
            <br />
            <span className="inline-block mt-4">
              <span className="gradient-text">이렇게 동작합니다</span>
            </span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            스마트스토어 데이터를 안전하게 받아, 구글에 맞는 구조로 바꿔주고,
            <br />
            검색 성과를 한 눈에 보여줍니다.
          </p>
        </div>
      </section>

      {/* 상세 단계 */}
      <section className="section-padding bg-brand-navy-light">
        <div className="container-custom max-w-5xl">
          <div className="space-y-16">
            {detailedSteps.map((step) => (
              <div key={step.number} className="glass-card p-8 lg:p-12">
                {/* 단계 헤더 */}
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-brand-neon mb-2">
                      STEP {step.number}
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {step.title}
                    </h2>
                  </div>
                </div>

                {/* 상세 내용 */}
                <div className="space-y-6">
                  {step.details.map((detail, i) => (
                    <div
                      key={i}
                      className="pl-8 border-l-2 border-white/10 hover:border-brand-neon/30 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {detail.subtitle}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {detail.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl text-center">
          <div className="glass-card p-8 lg:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
              복잡해 보이지만, 상점주는
              <br />
              <span className="inline-block mt-3">
                <span className="gradient-text">아무것도 안 해도 됩니다</span>
              </span>
            </h3>
            <p className="text-lg text-white/70 mb-8">
              네이버에 상품만 올리면, GConnect가 모든 과정을 자동으로 처리합니다.
            </p>
            <InquiryButton className="btn-neon text-lg px-8 py-4">
              무료로 시작하기
            </InquiryButton>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

