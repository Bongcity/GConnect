import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="relative w-40 h-10">
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
          <span className="px-2 py-1 rounded-lg text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            ADMIN
          </span>
        </Link>

        {children}
      </div>
    </div>
  );
}

