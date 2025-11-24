'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: '네이버 정책에 위배되지는 않나요?',
    answer:
      '공식 정책 범위 내에서 데이터 연동 및 크롤링/연동 방식을 설계하며, 과도한 요청이나 비정상적인 수집은 지양합니다. 네이버 이용약관과 로봇 배제 표준을 준수하여 운영합니다.',
  },
  {
    question: '어떤 데이터를 가져가나요?',
    answer:
      '상품명, 가격, 이미지, 카테고리, 옵션 등 상품 정보와 상점명, 상점 ID 등 상점 기본 정보만 수집합니다. 구매자 개인정보, 결제정보, 주문 내역 등은 절대 수집하지 않습니다.',
  },
  {
    question: '해지하면 구글에 노출된 페이지는 어떻게 되나요?',
    answer:
      '해지 요청 시 일정 기간 내에 검색 페이지를 비활성화하고 삭제 처리합니다. 구글 인덱스에서 완전히 제거되기까지는 시간이 걸릴 수 있으나, GConnect에서는 즉시 페이지를 비활성화합니다.',
  },
  {
    question: '스마트스토어가 여러 개인데, 한 번에 관리할 수 있나요?',
    answer:
      '현재는 상점별로 개별 계정을 사용하지만, 향후 에이전시 및 멀티샵 관리 기능을 제공할 계획입니다. Enterprise 플랜에서 우선 지원 예정이니 도입 상담을 통해 문의해주세요.',
  },
  {
    question: '월 요금 외에 추가 비용이 있나요?',
    answer:
      '없습니다. GConnect는 월 구독형 서비스이며, 클릭/노출에 따른 추가 과금이 없습니다. 선택한 플랜의 월 요금만 지불하시면 됩니다.',
  },
  {
    question: '무료 체험 기간이 있나요?',
    answer:
      '네, 스마트스토어를 연동하면 14일 동안 GConnect를 무료로 체험할 수 있습니다. 체험 기간 동안 모든 기능을 사용해보실 수 있습니다.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding">
      <div className="container-custom max-w-4xl">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            자주 묻는 질문
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70"
          >
            궁금하신 점을 빠르게 확인하세요
          </motion.p>
        </div>

        {/* FAQ 아코디언 */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass-card overflow-hidden"
            >
              {/* 질문 버튼 */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* 답변 (애니메이션) */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2 border-t border-white/10">
                      <p className="text-white/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

