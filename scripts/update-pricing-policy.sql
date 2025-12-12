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
  [displayName] = N'Starter',
  [description] = N'소규모 스마트스토어를 위한 기본 플랜 (상품 10개 이하)',
  [monthlyPrice] = 39000,
  [yearlyPrice] = 468000,  -- 월 39,000 * 12 = 468,000
  [maxProducts] = 10,
  [maxApiCalls] = 1000,
  [features] = N'["최대 10개 상품 동기화","기본 SEO 구조화","기본 통계/리포트","자동 상품 동기화","이메일 지원"]',
  [updatedAt] = GETDATE()
WHERE [name] = 'STARTER';

PRINT N'  ✓ Starter: 39,000원/월, 10개 상품';

-- 2. Pro 플랜 업데이트
UPDATE [dbo].[Plans]
SET 
  [displayName] = N'Pro',
  [description] = N'성장하는 스토어를 위한 프로 플랜 (상품 50개 이하)',
  [monthlyPrice] = 59000,
  [yearlyPrice] = 708000,  -- 월 59,000 * 12 = 708,000
  [maxProducts] = 50,
  [maxApiCalls] = 5000,
  [features] = N'["최대 50개 상품 동기화","고급 SEO 구조화","고급 통계 (키워드/경쟁사/CTR 분석)","우선 기술 지원","자동 상품 동기화","API 연동"]',
  [updatedAt] = GETDATE()
WHERE [name] = 'PRO';

PRINT N'  ✓ Pro: 59,000원/월, 50개 상품';

-- 3. Enterprise 플랜 업데이트
UPDATE [dbo].[Plans]
SET 
  [displayName] = N'Enterprise',
  [description] = N'대규모 스토어 및 에이전시를 위한 커스텀 플랜 (상품 50개 초과)',
  [maxProducts] = 999999,  -- 사실상 무제한
  [maxApiCalls] = 999999,
  [features] = N'["커스텀 SEO 구조화","커스텀 연동/리포트","전담 매니저","SLA 보장","우선 기술 지원","웹훅 연동 (Slack, Discord 등)","맞춤형 기능 개발"]',
  [updatedAt] = GETDATE()
WHERE [name] = 'ENTERPRISE';

PRINT N'  ✓ Enterprise: 협의, 50개 초과';

-- 4. FREE 플랜 추가 (존재하지 않을 경우)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Plans] WHERE [name] = 'FREE')
BEGIN
  INSERT INTO [dbo].[Plans] (
    [id], [name], [displayName], [description],
    [maxProducts], [maxApiCalls], [monthlyPrice], [yearlyPrice],
    [features], [isActive], [isPublic], [sortOrder],
    [createdAt], [updatedAt]
  )
  VALUES (
    NEWID(), 'FREE', N'무료 체험', N'서비스 체험을 위한 무료 플랜 (상품 5개 이하)',
    5, 100, 0, 0,
    N'["최대 5개 상품 동기화","기본 SEO 구조화","기본 통계","자동 상품 동기화"]',
    1, 1, 0,
    GETDATE(), GETDATE()
  );
  PRINT N'  ✓ FREE: 0원/월, 5개 상품 (신규 생성)';
END
ELSE
BEGIN
  UPDATE [dbo].[Plans]
  SET 
    [displayName] = N'무료 체험',
    [description] = N'서비스 체험을 위한 무료 플랜 (상품 5개 이하)',
    [maxProducts] = 5,
    [maxApiCalls] = 100,
    [monthlyPrice] = 0,
    [yearlyPrice] = 0,
    [features] = N'["최대 5개 상품 동기화","기본 SEO 구조화","기본 통계","자동 상품 동기화"]',
    [updatedAt] = GETDATE()
  WHERE [name] = 'FREE';
  PRINT N'  ✓ FREE: 0원/월, 5개 상품 (업데이트)';
END

PRINT N'';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'✅ 가격 정책이 성공적으로 업데이트되었습니다!';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';

-- 5. 업데이트 결과 확인
SELECT 
  [name] AS '플랜명',
  [displayName] AS '표시명',
  [maxProducts] AS '최대 상품',
  [monthlyPrice] AS '월 가격',
  [yearlyPrice] AS '연 가격',
  [maxApiCalls] AS 'API 호출',
  [isActive] AS '활성',
  [updatedAt] AS '업데이트 시간'
FROM [dbo].[Plans]
ORDER BY [sortOrder] ASC, [maxProducts] ASC;

PRINT N'';
PRINT N'📋 최종 플랜 정책:';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'  FREE     : 0원/월      | 5개 상품';
PRINT N'  Starter  : 39,000원/월  | 10개 상품';
PRINT N'  Pro      : 59,000원/월  | 50개 상품';
PRINT N'  Enterprise: 협의       | 50개 초과';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';
PRINT N'💡 참고: 기존 사용자의 구독은 자동으로 유지됩니다.';
PRINT N'        새로운 가격은 신규 구독 및 갱신 시 적용됩니다.';
GO

