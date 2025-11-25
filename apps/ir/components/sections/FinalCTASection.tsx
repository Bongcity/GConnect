'use client';

import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function FinalCTASection() {
  return (
    <section id="inquiry" className="section-padding bg-brand-navy-light">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-neon/20 via-brand-cyan/10 to-transparent" />
          
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,240,137,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,212,255,0.3),transparent_50%)]" />
          </div>

          {/* 콘텐츠 */}
          <div className="relative glass-card p-12 lg:p-16 text-center">
            {/* 아이콘 배지 */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-neon/20 border border-brand-neon/30 mb-6"
            >
              <SparklesIcon className="w-5 h-5 text-brand-neon" />
              <span className="text-sm font-semibold text-brand-neon">
                무료 체험 제공
              </span>
            </motion.div>

            {/* 제목 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              지금 스마트스토어를 연동하면,
              <br />
              <span className="gradient-text">14일 동안 무료 체험</span>
            </motion.h2>

            {/* 서브텍스트 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto"
            >
              개발 지식 없이, 클릭 몇 번으로 시작하세요.
              <br />
              구글 검색 노출부터 성과 분석까지 GConnect가 자동으로 처리합니다.
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => {
                  // 문의 위젯 열기 (나중에 구현)
                  const event = new CustomEvent('openInquiryModal');
                  window.dispatchEvent(event);
                }}
                className="btn-neon text-lg px-8 py-4 inline-flex items-center gap-2 group"
              >
                <span>무료 시작하기</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  // 문의 위젯 열기
                  const event = new CustomEvent('openInquiryModal');
                  window.dispatchEvent(event);
                }}
                className="btn-secondary text-lg px-8 py-4"
              >
                도입 상담 요청
              </button>
            </motion.div>

            {/* 추가 정보 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/60"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-brand-neon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>신용카드 등록 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-brand-neon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>언제든지 해지 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-brand-neon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>기술 지원 포함</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

