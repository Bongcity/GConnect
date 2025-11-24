import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function LogoTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy flex flex-col items-center justify-center p-8">
      {/* 뒤로가기 */}
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>홈으로</span>
      </Link>

      <div className="max-w-6xl w-full space-y-12">
        {/* 페이지 제목 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">GConnect 로고</h1>
          <p className="text-white/60">다양한 크기와 스타일</p>
        </div>

        {/* 로고 샘플들 */}
        <div className="space-y-16">
          {/* 초대형 로고 */}
          <div className="glass-card p-12">
            <h2 className="text-xl font-bold text-white mb-8 text-center">초대형 (800px)</h2>
            <div className="flex justify-center">
              <div className="relative w-[800px] h-[200px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                  style={{
                    WebkitMaskImage: 'url(/GConnect-logo.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/GConnect-logo.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 대형 로고 */}
          <div className="glass-card p-12">
            <h2 className="text-xl font-bold text-white mb-8 text-center">대형 (500px)</h2>
            <div className="flex justify-center">
              <div className="relative w-[500px] h-[125px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                  style={{
                    WebkitMaskImage: 'url(/GConnect-logo.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/GConnect-logo.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 중형 로고 */}
          <div className="glass-card p-12">
            <h2 className="text-xl font-bold text-white mb-8 text-center">중형 (300px)</h2>
            <div className="flex justify-center">
              <div className="relative w-[300px] h-[75px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                  style={{
                    WebkitMaskImage: 'url(/GConnect-logo.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/GConnect-logo.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 다양한 배경에서 테스트 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 어두운 배경 */}
            <div className="glass-card p-8 bg-black/30">
              <h3 className="text-lg font-bold text-white mb-4 text-center">어두운 배경</h3>
              <div className="flex justify-center">
                <div className="relative w-48 h-12">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                    style={{
                      WebkitMaskImage: 'url(/GConnect-logo.png)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: 'url(/GConnect-logo.png)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 밝은 배경 */}
            <div className="glass-card p-8 bg-white/10">
              <h3 className="text-lg font-bold text-white mb-4 text-center">밝은 배경</h3>
              <div className="flex justify-center">
                <div className="relative w-48 h-12">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                    style={{
                      WebkitMaskImage: 'url(/GConnect-logo.png)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: 'url(/GConnect-logo.png)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 원본 이미지 */}
          <div className="glass-card p-12">
            <h2 className="text-xl font-bold text-white mb-8 text-center">원본 이미지 (검은색)</h2>
            <div className="flex justify-center bg-white/5 rounded-xl p-8">
              <Image
                src="/GConnect-logo.png"
                alt="GConnect Logo Original"
                width={400}
                height={100}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

