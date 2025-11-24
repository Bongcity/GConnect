'use client';

import {
  BoltIcon,
  ShieldCheckIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';

const values = [
  {
    name: 'Automated',
    title: '자동화',
    description:
      '반복적인 상품 등록/수정 작업 없이, 자동으로 연동하고 갱신합니다.',
    icon: BoltIcon,
    color: 'from-yellow-400 to-orange-500',
    image: '/ir-m-1.png',
  },
  {
    name: 'Safe',
    title: '안전',
    description:
      '필요한 상품/상점 정보만 수집하고, 개인정보/결제정보는 저장하지 않습니다.',
    icon: ShieldCheckIcon,
    color: 'from-green-400 to-emerald-500',
    image: '/ir-m-2.png',
  },
  {
    name: 'Fair',
    title: '공정',
    description:
      '입점 상점은 우선 노출하지만, 검색 품질과 유저에게 유용한 순으로 정렬합니다.',
    icon: ScaleIcon,
    color: 'from-blue-400 to-cyan-500',
    image: '/ir-m-3.png',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function MissionSection() {
  return (
    <section id="about" className="section-padding bg-brand-navy-light">
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
            GConnect의 미션
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/70 leading-relaxed"
          >
            스마트스토어 사장님이 <strong className="text-brand-neon">마케팅 전문가가 아니어도</strong>,
            구글 유입을 안정적으로 만들 수 있게 하는 것.
          </motion.p>

          {/* 추가 강조 문구 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card"
          >
            <span className="text-sm text-white/80">
              💡 광고 클릭당 과금이 아닌{' '}
              <strong className="text-brand-neon">플랫폼 사용료</strong>만
              받습니다
            </span>
          </motion.div>
        </div>

        {/* 가치 카드 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.name}
              variants={item}
              className="relative glass-card-hover p-8 group overflow-hidden"
            >
              {/* 배경 이미지 */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={value.image}
                  alt={value.title}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/80 to-transparent" />
              </div>

              {/* 컨텐츠 */}
              <div className="relative z-10">
                {/* 아이콘 */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                {/* 제목 */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-brand-neon mb-2">{value.name}</p>

                {/* 설명 */}
                <p className="text-white/70 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

