'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category,
        }),
      });

      if (response.ok) {
        alert('문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.');
        setTitle('');
        setContent('');
        setCategory('GENERAL');
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || '문의 접수에 실패했습니다.');
      }
    } catch (error) {
      console.error('Inquiry error:', error);
      alert('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">문의하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              문의 유형
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-brand-neon transition-colors"
              required
            >
              <option value="GENERAL" className="bg-gray-800 text-white">일반 문의</option>
              <option value="TECHNICAL" className="bg-gray-800 text-white">기술 지원</option>
              <option value="BILLING" className="bg-gray-800 text-white">결제/구독</option>
              <option value="FEATURE" className="bg-gray-800 text-white">기능 요청</option>
              <option value="BUG" className="bg-gray-800 text-white">버그 신고</option>
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-brand-neon transition-colors"
              placeholder="문의 제목을 입력하세요"
              required
              maxLength={200}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-brand-neon transition-colors min-h-[200px] resize-none"
              placeholder="문의 내용을 자세히 입력해주세요.&#10;&#10;예시:&#10;- 문제가 발생한 상황&#10;- 예상했던 동작&#10;- 실제 발생한 동작&#10;- 오류 메시지 (있다면)"
              required
              maxLength={2000}
            />
            <p className="mt-2 text-sm text-white/60">
              {content.length} / 2000자
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-neon flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '접수 중...' : '문의하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

