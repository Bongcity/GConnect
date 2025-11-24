'use client';

import { BuildingStorefrontIcon, UsersIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const audiences = [
  {
    title: '스마트스토어 운영자',
    icon: BuildingStorefrontIcon,
    color: 'from-orange-500 to-red-500',
    descriptions: [
      '상품 수가 많아졌지만, 광고/SEO까지 챙기기 힘든 사장님',
      '구글 검색에서 내 상품이 어떻게 보이는지 궁금한 스토어',
      '마케팅 비용은 줄이고 안정적인 유입을 원하는 사업자',
    ],
  },
  {
    title: '마케팅 대행사 / 에이전시',
    icon: UsersIcon,
    color: 'from-blue-500 to-purple-500',
    descriptions: [
      '여러 스마트스토어를 관리하면서 구글 유입/검색 성과를 클라이언트에게 보고해야 하는 회사',
      'SEO 전문가 없이도 자동화된 솔루션이 필요한 에이전시',
      '다수의 클라이언트를 효율적으로 관리하고 싶은 대행사',
    ],
  },
];

export default function TargetAudienceSection() {
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
            누가 사용하나요?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70"
          >
            GConnect는 이런 분들을 위해 만들어졌습니다
          </motion.p>
        </div>

        {/* 대상 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card-hover p-8 lg:p-10"
            >
              {/* 아이콘 */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <audience.icon className="w-8 h-8 text-white" />
              </div>

              {/* 제목 */}
              <h3 className="text-2xl font-bold text-white mb-6">
                {audience.title}
              </h3>

              {/* 설명 리스트 */}
              <ul className="space-y-4">
                {audience.descriptions.map((desc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-neon/20 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3 text-brand-neon"
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
                    </div>
                    <span className="text-white/70 leading-relaxed">
                      {desc}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

