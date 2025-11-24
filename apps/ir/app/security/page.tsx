import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import InquiryButton from '@/components/InquiryButton';
import Image from 'next/image';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  TrashIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: '데이터 & 보안 정책 - GConnect IR',
  description:
    'GConnect의 데이터 수집 범위, 보안 정책, 삭제 정책을 투명하게 공개합니다.',
};

const dataCollectionTable = [
  {
    item: '상품명, 가격, 이미지',
    collected: true,
    purpose: '상품 페이지 생성 및 검색 노출',
  },
  {
    item: '카테고리, 옵션',
    collected: true,
    purpose: '필터/정렬/SEO 구조화',
  },
  {
    item: '상점명, 상점 ID',
    collected: true,
    purpose: '상점 정보 표시/통계 집계',
  },
  {
    item: '구매자 정보',
    collected: false,
    purpose: '-',
  },
  {
    item: '결제/배송 정보',
    collected: false,
    purpose: '-',
  },
];

const securityFeatures = [
  {
    icon: ShieldCheckIcon,
    title: '최소 데이터 수집',
    description:
      '서비스 운영에 필요한 최소한의 데이터만 수집합니다. 구매자 개인정보, 결제정보, 주문 내역은 절대 수집하지 않습니다.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: LockClosedIcon,
    title: '암호화 저장',
    description:
      '비밀번호는 해시 처리하고, API 키/토큰은 암호화하여 저장합니다. 내부 관리자 권한을 분리하고 최소 권한 원칙을 적용합니다.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: TrashIcon,
    title: '투명한 삭제 정책',
    description:
      '해지 요청 시 일정 기간 내에 데이터를 완전 삭제합니다. 통계 데이터는 익명/집계 형태로만 보관할 수 있습니다.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: DocumentCheckIcon,
    title: '정책 준수',
    description:
      '네이버 및 구글 정책 범위 내에서 데이터를 처리하며, 기술/법률 자문을 통해 약관 및 정책을 정비합니다.',
    color: 'from-orange-400 to-red-500',
  },
];

export default function SecurityPage() {
  return (
    <MainLayout>
      {/* 히어로 */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="gradient-text">데이터 & 보안</span> 정책
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            GConnect는 스마트스토어 데이터를 다루기 때문에,
            <br />
            최소 수집 · 안전한 저장 · 투명한 삭제 원칙을 지킵니다.
          </p>
        </div>
      </section>

      {/* 데이터 수집 범위 표 */}
      <section className="section-padding bg-brand-navy-light">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            데이터 수집 범위
          </h2>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      항목
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                      수집 여부
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      사용 목적
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataCollectionTable.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white">{row.item}</td>
                      <td className="px-6 py-4 text-center">
                        {row.collected ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-neon/20">
                            <svg
                              className="w-5 h-5 text-brand-neon"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 보안 기능 */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            보안 정책
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="glass-card relative p-8 overflow-hidden group">
                {/* 배경 이미지 (4개 모두) */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={`/ir-D-${index + 1}.png`}
                    alt={feature.title}
                    fill
                    className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/50 to-brand-navy/30" />
                </div>

                {/* 콘텐츠 */}
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 삭제 정책 상세 */}
      <section className="section-padding bg-brand-navy-light">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8">
            삭제/해지 정책
          </h2>

          <div className="glass-card p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                해지 요청 시
              </h3>
              <p className="text-white/70 leading-relaxed">
                해지 요청을 하시면 일정 기간 내에 모든 상품 데이터 및 상점
                정보를 완전히 삭제합니다. 구글 인덱스에서 페이지가 제거되기까지
                시간이 걸릴 수 있으나, GConnect에서는 즉시 비활성화 처리합니다.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                통계 데이터 보관
              </h3>
              <p className="text-white/70 leading-relaxed">
                서비스 개선 목적으로 익명화/집계된 통계 데이터는 일정 기간 보관할
                수 있습니다. 이 데이터에는 개인 식별 정보가 포함되지 않습니다.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                백업 정책
              </h3>
              <p className="text-white/70 leading-relaxed">
                시스템 백업에 포함된 데이터는 보관 기간 종료 후 자동으로
                삭제됩니다. 백업 데이터에 대한 접근은 최소 권한 관리자에게만
                허용됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl text-center">
          <div className="glass-card p-8 lg:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              추가 질문이 있으신가요?
            </h3>
            <p className="text-lg text-white/70 mb-8">
              보안 정책에 대해 더 자세히 알고 싶으시다면 문의해주세요.
            </p>
            <InquiryButton className="btn-neon text-lg px-8 py-4">
              문의하기
            </InquiryButton>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

