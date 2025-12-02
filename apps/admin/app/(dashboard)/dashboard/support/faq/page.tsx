'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  isPublic: boolean;
  sortOrder: number;
  viewCount: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    category: '사용법',
    question: '',
    answer: '',
    isPublic: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/admin/support/faq');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      category: '사용법',
      question: '',
      answer: '',
      isPublic: true,
      sortOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/support/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('FAQ가 등록되었습니다.');
        setIsModalOpen(false);
        fetchFAQs();
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('FAQ 등록에 실패했습니다.');
    }
  };

  const groupedFaqs = faqs.reduce((acc: any, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">FAQ 관리</h1>
          <p className="text-white/60">자주 묻는 질문 관리</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          FAQ 추가
        </button>
      </div>

      {Object.keys(groupedFaqs).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{category}</h2>
          <div className="space-y-4">
            {groupedFaqs[category].map((faq: FAQ) => (
              <div key={faq.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      {faq.isPublic ? (
                        <EyeIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-white/70">{faq.answer}</p>
                    <p className="text-xs text-white/40 mt-2">
                      조회수: {faq.viewCount} • 순서: {faq.sortOrder}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="btn-secondary text-sm">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="btn-secondary text-sm text-red-400 hover:bg-red-500/20">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* FAQ 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">FAQ 추가</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-xl text-white focus:outline-none"
                  required
                >
                  <option value="사용법">사용법</option>
                  <option value="요금">요금</option>
                  <option value="기술지원">기술지원</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  질문 *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="질문을 입력하세요"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  답변 *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="답변을 입력하세요"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    순서
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-400/50"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/80">공개</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  취소
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

