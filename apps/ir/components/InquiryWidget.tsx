'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { irInquirySchema } from '@gconnect/lib/validations';
import type { IRInquiryFormData } from '@gconnect/lib/types';

export default function InquiryWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<IRInquiryFormData>({
    storeName: '',
    email: '',
    phone: '',
    planIntent: undefined,
    inquiryType: 'ADOPTION',
    message: '',
  });

  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // 전역 이벤트 리스너로 모달 열기
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openInquiryModal', handleOpen);
    return () => window.removeEventListener('openInquiryModal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToPrivacy) {
      setSubmitError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 유효성 검사
      const validated = irInquirySchema.parse({
        ...formData,
        pageUrl: window.location.href,
      });

      // API 호출
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || '문의 접수에 실패했습니다.');
      }

      setSubmitSuccess(true);
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        setIsOpen(false);
        setSubmitSuccess(false);
        setFormData({
          storeName: '',
          email: '',
          phone: '',
          planIntent: undefined,
          inquiryType: 'ADOPTION',
          message: '',
        });
        setAgreedToPrivacy(false);
      }, 3000);
    } catch (error: any) {
      setSubmitError(
        error.message || '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn-neon px-6 py-3 rounded-full shadow-2xl shadow-brand-neon/30 flex items-center gap-2 group hover:scale-105 transition-all duration-300"
        aria-label="문의하기"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span className="hidden sm:inline">궁금한 점 있으신가요?</span>
        <span className="sm:hidden">문의</span>
      </button>

      {/* 문의 모달 */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl glass-card p-8 text-left align-middle shadow-xl transition-all">
                  {/* 모달 헤더 */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-white mb-2"
                      >
                        도입 문의
                      </Dialog.Title>
                      <p className="text-sm text-white/60">
                        GConnect 도입에 대해 궁금하신 점을 남겨주세요
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-white/60 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* 성공 메시지 */}
                  {submitSuccess ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-neon/20 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-brand-neon"
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
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        문의가 접수되었습니다
                      </h4>
                      <p className="text-white/70">
                        남겨주신 연락처로 빠르게 답변 드리겠습니다.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* 에러 메시지 */}
                      {submitError && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="text-sm text-red-400">{submitError}</p>
                        </div>
                      )}

                      {/* 스마트스토어 이름 */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          스마트스토어 이름 <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.storeName}
                          onChange={(e) =>
                            setFormData({ ...formData, storeName: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all"
                          placeholder="예: 멋진상점"
                        />
                      </div>

                      {/* 이메일 */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          이메일 <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all"
                          placeholder="example@email.com"
                        />
                      </div>

                      {/* 연락처 */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          연락처
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all"
                          placeholder="010-1234-5678"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* 관심 플랜 */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            관심 플랜
                          </label>
                          <select
                            value={formData.planIntent || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                planIntent: e.target.value as any,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all"
                          >
                            <option value="">선택하세요</option>
                            <option value="UNKNOWN">아직 잘 모르겠어요</option>
                            <option value="STARTER">Starter (10,000개 이하)</option>
                            <option value="PRO">Pro (50,000개 이하)</option>
                            <option value="ENTERPRISE">Enterprise (50,000개 초과)</option>
                          </select>
                        </div>

                        {/* 문의 유형 */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            문의 유형 <span className="text-red-400">*</span>
                          </label>
                          <select
                            required
                            value={formData.inquiryType}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                inquiryType: e.target.value as any,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all"
                          >
                            <option value="ADOPTION">도입 상담</option>
                            <option value="PRICING">요금제/비용 문의</option>
                            <option value="TECH">기술/연동 문의</option>
                            <option value="OTHER">기타</option>
                          </select>
                        </div>
                      </div>

                      {/* 문의 내용 */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          문의 내용 <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-neon/50 focus:border-transparent transition-all resize-none"
                          placeholder="궁금하신 점을 자유롭게 적어주세요 (최소 10자)"
                        />
                      </div>

                      {/* 개인정보 동의 */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="privacy-agree"
                          checked={agreedToPrivacy}
                          onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-neon focus:ring-brand-neon focus:ring-offset-0"
                        />
                        <label
                          htmlFor="privacy-agree"
                          className="text-sm text-white/70 cursor-pointer"
                        >
                          <span className="text-red-400">*</span> 문의 접수를 위한 개인정보 수집
                          및 이용에 동의합니다.
                        </label>
                      </div>

                      {/* 제출 버튼 */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 px-6 py-3 rounded-lg bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !agreedToPrivacy}
                          className="flex-1 btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? '전송 중...' : '문의하기'}
                        </button>
                      </div>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

