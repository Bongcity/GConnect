'use client';

import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '300,000',
    maxProducts: '10,000개 이하',
    description: '소규모 스마트스토어를 위한 기본 플랜',
    features: [
      '기본 SEO 구조화',
      '기본 통계/리포트',
      '자동 상품 동기화',
      '이메일 지원',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: '800,000',
    maxProducts: '50,000개 이하',
    description: '성장하는 스토어를 위한 프로 플랜',
    features: [
      '고급 SEO 구조화',
      '고급 통계 (키워드/경쟁사/CTR 분석)',
      '우선 기술 지원',
      '자동 상품 동기화',
      'API 연동',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '협의',
    maxProducts: '50,000개 초과',
    description: '대규모 스토어 및 에이전시를 위한 커스텀 플랜',
    features: [
      '커스텀 SEO 구조화',
      '커스텀 연동/리포트',
      '전담 매니저',
      'SLA 보장',
      '우선 기술 지원',
    ],
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding">
      <div className="container-custom">
        {/* 섹션 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            요금제
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70 mb-4"
          >
            상품 수에 따른 합리적인 요금제
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card"
          >
            <span className="text-sm text-white/80">
              💰 <strong className="text-brand-neon">월 구독형 서비스</strong>
              이며, 클릭/노출에 따른 추가 과금이 없습니다
            </span>
          </motion.div>
        </div>

        {/* 요금제 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy text-xs font-bold shadow-lg">
                    <SparklesIcon className="w-3 h-3" />
                    <span>POPULAR</span>
                  </div>
                </div>
              )}

              <div
                className={`glass-card p-8 h-full flex flex-col ${
                  plan.popular
                    ? 'border-2 border-brand-neon/30 shadow-xl shadow-brand-neon/10'
                    : ''
                }`}
              >
                {/* 플랜 헤더 */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/60 mb-4">
                    {plan.description}
                  </p>

                  {/* 가격 */}
                  <div className="flex items-baseline gap-2 mb-2">
                    {plan.price === '협의' ? (
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white">
                          ₩{plan.price}
                        </span>
                        <span className="text-white/60">/월</span>
                      </>
                    )}
                  </div>

                  {/* 상품 수 */}
                  <p className="text-sm text-brand-neon font-semibold">
                    {plan.maxProducts}
                  </p>
                </div>

                {/* 기능 리스트 */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-neon/20 flex items-center justify-center mt-0.5">
                        <CheckIcon className="w-3 h-3 text-brand-neon" />
                      </div>
                      <span className="text-sm text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA 버튼 */}
                <Link
                  href="#inquiry"
                  className={`block text-center font-semibold px-6 py-3 rounded-lg transition-all duration-300 ${
                    plan.popular
                      ? 'btn-neon'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.name === 'Enterprise' ? '도입 상담' : '시작하기'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 추가 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-white/50">
            * 네이버 상점 등급에 따른 추가 혜택/할인은 협의 후 적용 가능합니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

