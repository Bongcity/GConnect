'use client';

import { ArrowRightIcon, SparklesIcon, CheckCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    }
  },
};

export default function HeroSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="about" className="relative min-h-screen flex items-center overflow-hidden">
      {/* 배경 레이어 */}
      <div className="absolute inset-0">
        {/* 그라디언트 오브 */}
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-brand-neon/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-brand-cyan/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
        
        {/* 그리드 패턴 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,240,137,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,240,137,.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        
        {/* 플로팅 파티클 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-neon/50 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: '60%',
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10 py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center"
        >
          {/* 좌측: 텍스트 & CTA */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={item} className="space-y-6">
              {/* 상단 배지 - 네온 효과 */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-navy/50 border border-brand-neon/30 backdrop-blur-xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon/10 via-brand-cyan/10 to-brand-neon/10 animate-pulse" />
                <BoltIcon className="w-4 h-4 text-brand-neon relative z-10" />
                <span className="text-sm font-bold tracking-wide text-brand-neon relative z-10">
                  SMARTSTORE × GOOGLE
                </span>
                <div className="absolute -right-2 w-8 h-8 bg-brand-neon/20 rounded-full blur-md" />
              </div>

              {/* 메인 헤드라인 */}
              <h1 className="space-y-2">
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tight">
                  <span className="text-white">스마트스토어를</span>
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tight">
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-brand-neon via-brand-cyan to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      구글에 연결
                    </span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-neon/50 via-brand-cyan/50 to-purple-400/50 blur-2xl opacity-30" />
                  </span>
                </span>
              </h1>

              {/* 서브 헤드라인 */}
              <p className="text-xl sm:text-2xl text-white/80 leading-relaxed max-w-2xl font-light">
                개발 지식 <span className="text-white font-semibold">제로</span>로 
                <span className="text-brand-neon font-semibold"> 5분 안에</span> 시작하는 구글 SEO
              </p>
            </motion.div>

            {/* 핵심 기능 - 카드 형태 */}
            <motion.div variants={item} className="grid grid-cols-2 gap-3">
              {[
                { icon: '⚡', text: '자동 동기화' },
                { icon: '🎯', text: 'SEO 최적화' },
                { icon: '🚀', text: '빠른 인덱싱' },
                { icon: '📊', text: '성과 분석' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-neon/30 transition-all duration-300 group cursor-pointer"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                  <span className="text-sm font-medium text-white/90 group-hover:text-white">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA 버튼 */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#inquiry"
                className="group relative px-8 py-5 rounded-2xl font-bold text-lg text-brand-navy bg-gradient-to-r from-brand-neon to-brand-cyan overflow-hidden inline-flex items-center justify-center gap-2 hover:gap-3 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-neon opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">14일 무료로 시작하기</span>
                <ArrowRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="group px-8 py-5 rounded-2xl font-bold text-lg text-white border-2 border-white/20 hover:border-brand-neon/50 hover:bg-white/5 transition-all duration-300 inline-flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <span>작동 원리</span>
                <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </motion.div>

            {/* 소셜 프루프 - 미니멀 */}
            <motion.div variants={item} className="flex items-center gap-6 pt-6 border-t border-white/10">
              {[
                { value: '500+', label: '상점' },
                { value: '10만+', label: '상품' },
                { value: '4.9/5', label: '평점' },
              ].map((stat, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="text-2xl font-black text-white group-hover:text-brand-neon transition-colors">{stat.value}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 우측: 인터랙티브 플로우 카드 */}
          <motion.div
            variants={item}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              {/* 글로우 효과 */}
              <div className="absolute -inset-8 bg-gradient-to-r from-brand-neon/20 via-brand-cyan/20 to-purple-500/20 rounded-3xl blur-3xl opacity-50 animate-pulse" />
              
              {/* 메인 플로우 카드 */}
              <div className="relative">
                {/* 플로우 단계들 */}
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      emoji: '🛍️',
                      title: '네이버 스마트스토어',
                      desc: '상품 자동 수집',
                      gradient: 'from-blue-500 via-indigo-500 to-blue-600',
                      delay: 0,
                    },
                    {
                      id: 2,
                      emoji: '⚡',
                      title: 'GConnect Engine',
                      desc: 'AI SEO 최적화',
                      gradient: 'from-brand-neon via-brand-cyan to-brand-neon',
                      delay: 0.2,
                      highlight: true,
                    },
                    {
                      id: 3,
                      emoji: '🌐',
                      title: '구글 검색',
                      desc: '전세계 노출',
                      gradient: 'from-purple-500 via-pink-500 to-purple-600',
                      delay: 0.4,
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + step.delay, type: "spring" }}
                      onMouseEnter={() => setHoveredCard(step.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="relative group"
                    >
                      {/* 연결선 */}
                      {index < 2 && (
                        <div className="absolute left-8 top-full w-0.5 h-4 bg-gradient-to-b from-brand-neon/50 to-transparent z-0" />
                      )}

                      {/* 카드 */}
                      <div
                        className={`relative p-6 rounded-2xl backdrop-blur-xl transition-all duration-500 cursor-pointer ${
                          step.highlight
                            ? 'bg-white/10 border-2 border-brand-neon/50 shadow-2xl shadow-brand-neon/20'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        } ${
                          hoveredCard === step.id ? 'scale-105 -translate-y-1' : ''
                        }`}
                      >
                        {/* 배경 그라디언트 (호버) */}
                        {hoveredCard === step.id && (
                          <motion.div
                            layoutId="hoverBackground"
                            className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10 rounded-2xl`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}

                        <div className="relative flex items-center gap-5">
                          {/* 아이콘 */}
                          <div className="relative">
                            <div
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                            >
                              {step.emoji}
                            </div>
                            {/* 번호 뱃지 */}
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-navy border-2 border-brand-neon flex items-center justify-center">
                              <span className="text-xs font-black text-brand-neon">{step.id}</span>
                            </div>
                          </div>

                          {/* 텍스트 */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-neon transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-sm text-white/60 group-hover:text-white/90 transition-colors">
                              {step.desc}
                            </p>
                          </div>

                          {/* 화살표 아이콘 */}
                          <ArrowRightIcon className="w-5 h-5 text-white/30 group-hover:text-brand-neon group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* 펄스 효과 */}
                        {step.highlight && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-neon/20 to-brand-cyan/20 animate-pulse opacity-50" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 하단 통계 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10"
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { icon: '⚡', value: '5분', label: '설정' },
                      { icon: '🚀', value: '24시간', label: '노출' },
                      { icon: '✨', value: '99%', label: '성공률' },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="group hover:scale-110 transition-transform cursor-pointer"
                      >
                        <div className="text-xl mb-1">{stat.icon}</div>
                        <div className="text-lg font-black text-brand-neon group-hover:text-brand-cyan transition-colors">
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 플로팅 요소들 */}
                <motion.div
                  className="absolute -right-4 top-10 w-20 h-20 rounded-full bg-brand-neon/20 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute -left-4 bottom-10 w-16 h-16 rounded-full bg-brand-cyan/20 blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


