'use client';

import {
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const securityPoints = [
  {
    icon: ShieldCheckIcon,
    title: '개인정보 미수집',
    description:
      '구매자 개인정보 및 결제 정보는 수집하지 않습니다. 상점과 상품 정보만 사용합니다.',
  },
  {
    icon: LockClosedIcon,
    title: '최소 데이터 수집',
    description:
      '상품/상점 정보 등 서비스 운영에 필요한 최소한의 데이터만 사용합니다.',
  },
  {
    icon: DocumentTextIcon,
    title: '투명한 삭제 정책',
    description:
      '해지 시 데이터 삭제/보관 정책을 명확히 운영합니다. 상세 내용은 보안 정책 페이지를 참고하세요.',
  },
];

export default function SecurityPreviewSection() {
  return (
    <section className="section-padding bg-brand-navy-light">
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
            데이터 & 보안
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70"
          >
            안전하고 투명한 데이터 관리
          </motion.p>
        </div>

        {/* 보안 포인트 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {securityPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card relative p-6 text-center overflow-hidden group"
            >
              {/* 배경 이미지 */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={`/ir-D-${index + 1}.png`}
                  alt={point.title}
                  fill
                  className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/55 to-brand-navy/35" />
              </div>

              {/* 콘텐츠 */}
              <div className="relative z-10">
                {/* 아이콘 */}
                <div className="w-14 h-14 rounded-full bg-brand-neon/20 flex items-center justify-center mx-auto mb-4">
                  <point.icon className="w-7 h-7 text-brand-neon" />
                </div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {point.title}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-white/70 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/security"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <span>데이터/보안 정책 자세히 보기</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

