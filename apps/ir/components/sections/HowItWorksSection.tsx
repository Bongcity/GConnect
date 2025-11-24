'use client';

import {
  LinkIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';

const steps = [
  {
    number: '01',
    title: '스마트스토어 연결',
    description:
      '스토어 인증 후 상품/카테고리 데이터 자동 수집. 상점주는 "연동 설정"만 한 번 하면 됩니다.',
    action: '연동 설정만 한 번',
    icon: LinkIcon,
    color: 'from-blue-500 to-cyan-500',
    image: '/ir-B-1.png',
  },
  {
    number: '02',
    title: 'SEO 구조 자동 생성',
    description:
      '상품명/카테고리/옵션을 바탕으로 구글 친화적인 URL, 메타태그, 구조화 데이터를 자동 생성합니다.',
    action: 'GConnect가 자동으로 처리',
    icon: CogIcon,
    color: 'from-brand-neon to-brand-cyan',
    image: '/ir-B-2.png',
  },
  {
    number: '03',
    title: '검색 노출 & 성과 리포트',
    description:
      'GConnect 상품 페이지가 구글에 인덱싱되고, 구글 검색 노출/클릭/CTR 데이터를 상점 관리자 페이지에서 확인할 수 있습니다.',
    action: '성과를 한눈에 확인',
    icon: ChartBarIcon,
    color: 'from-purple-500 to-pink-500',
    image: '/ir-B-3.png',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding">
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
            GConnect가 하는 일
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70"
          >
            3단계로 완성되는 자동 SEO 최적화
          </motion.p>
        </div>

        {/* 단계 카드 */}
        <div className="space-y-8 lg:space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* 연결선 (마지막 제외) */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 lg:left-16 top-full h-8 lg:h-12 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
              )}

              {/* 단계 카드 */}
              <div className="relative glass-card-hover p-6 lg:p-8 overflow-hidden group">
                {/* 배경 이미지 */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/60 to-brand-navy/40" />
                </div>

                {/* 컨텐츠 */}
                <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                  {/* 아이콘 & 번호 */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-2xl font-bold text-white/30">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                      <span className="text-xs font-medium text-brand-neon uppercase">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                      {step.title}
                    </h3>

                    <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* 상점주가 할 일 */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-neon/10 border border-brand-neon/30">
                      <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse" />
                      <span className="text-sm font-semibold text-brand-neon">
                        {step.action}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 하단 강조 문구 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="glass-card inline-block px-8 py-4">
            <p className="text-lg text-white">
              <span className="text-white/70">상품을 네이버에 올리면,</span>{' '}
              <strong className="text-brand-neon">
                나머지는 GConnect가 합니다
              </strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

