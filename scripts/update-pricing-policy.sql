-- =====================================================
-- GConnect 가격 정책 업데이트
-- =====================================================
-- 변경 사항:
-- Starter: 300,000원 → 39,000원, 10,000개 → 10개
-- Pro: 800,000원 → 59,000원, 50,000개 → 50개
-- Enterprise: 50,000개 초과 → 50개 초과
-- =====================================================

USE [GConnect];
GO

-- 1. Starter 플랜 업데이트
UPDATE [dbo].[Plans]
SET 
  [monthlyPrice] = 39000,
  [yearlyPrice] = 468000,  -- 월 39,000 * 12 = 468,000
  [maxProducts] = 10,
  [description] = N'소규모 스마트스토어를 위한 기본 플랜 (상품 10개 이하)',
  [updatedAt] = GETDATE()
WHERE [name] = 'STARTER';

-- 2. Pro 플랜 업데이트
UPDATE [dbo].[Plans]
SET 
  [monthlyPrice] = 59000,
  [yearlyPrice] = 708000,  -- 월 59,000 * 12 = 708,000
  [maxProducts] = 50,
  [description] = N'성장하는 스토어를 위한 프로 플랜 (상품 50개 이하)',
  [updatedAt] = GETDATE()
WHERE [name] = 'PRO';

-- 3. Enterprise 플랜 업데이트
UPDATE [dbo].[Plans]
SET 
  [maxProducts] = 999999,  -- 사실상 무제한
  [description] = N'대규모 스토어 및 에이전시를 위한 커스텀 플랜 (상품 50개 초과)',
  [updatedAt] = GETDATE()
WHERE [name] = 'ENTERPRISE';

-- 4. 업데이트 결과 확인
SELECT 
  [name] AS '플랜명',
  [displayName] AS '표시명',
  [monthlyPrice] AS '월 가격',
  [yearlyPrice] AS '연 가격',
  [maxProducts] AS '최대 상품 수',
  [description] AS '설명',
  [isActive] AS '활성화',
  [updatedAt] AS '업데이트 시간'
FROM [dbo].[Plans]
ORDER BY [maxProducts] ASC;

PRINT N'✅ 가격 정책이 성공적으로 업데이트되었습니다.';
PRINT N'';
PRINT N'📋 변경 사항:';
PRINT N'  - Starter: 300,000원 → 39,000원, 10,000개 → 10개';
PRINT N'  - Pro: 800,000원 → 59,000원, 50,000개 → 50개';
PRINT N'  - Enterprise: 50,000개 초과 → 50개 초과 (가격 협의)';
GO

