import { z } from 'zod';

/**
 * IR 문의 폼 유효성 검사 스키마
 */
export const irInquirySchema = z.object({
  storeName: z
    .string()
    .min(1, '스마트스토어 이름을 입력해주세요')
    .max(200, '스마트스토어 이름은 200자 이내여야 합니다'),
  
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다')
    .max(200, '이메일은 200자 이내여야 합니다'),
  
  phone: z
    .string()
    .max(50, '연락처는 50자 이내여야 합니다')
    .optional()
    .nullable(),
  
  planIntent: z
    .enum(['STARTER', 'PRO', 'ENTERPRISE', 'UNKNOWN'])
    .optional()
    .nullable(),
  
  inquiryType: z.enum(['ADOPTION', 'PRICING', 'TECH', 'OTHER'], {
    errorMap: () => ({ message: '문의 유형을 선택해주세요' }),
  }),
  
  message: z
    .string()
    .min(10, '문의 내용은 최소 10자 이상 입력해주세요')
    .max(5000, '문의 내용은 5000자 이내여야 합니다'),
  
  pageUrl: z.string().max(500).optional().nullable(),
});

export type IRInquiryInput = z.infer<typeof irInquirySchema>;

