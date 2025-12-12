-- =====================================================
-- 빠른 플랜 업데이트 (간소화 버전)
-- =====================================================
USE [GConnect];
GO

PRINT N'플랜 업데이트 시작...';
PRINT N'';

-- 1. Starter 업데이트
UPDATE [dbo].[Plans]
SET 
  [displayName] = N'Starter',
  [monthlyPrice] = 39000,
  [maxProducts] = 10
WHERE [name] = 'STARTER';

PRINT N'✓ Starter 업데이트 완료';

-- 2. Pro 업데이트
UPDATE [dbo].[Plans]
SET 
  [displayName] = N'Pro',
  [monthlyPrice] = 59000,
  [maxProducts] = 50
WHERE [name] = 'PRO';

PRINT N'✓ Pro 업데이트 완료';

-- 3. Enterprise 업데이트
UPDATE [dbo].[Plans]
SET 
  [displayName] = N'Enterprise',
  [maxProducts] = 999999
WHERE [name] = 'ENTERPRISE';

PRINT N'✓ Enterprise 업데이트 완료';

-- 4. 결과 확인
PRINT N'';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'업데이트된 플랜:';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
  [name] AS 플랜명,
  [displayName] AS 표시명,
  [maxProducts] AS 최대상품,
  [monthlyPrice] AS 월가격
FROM [dbo].[Plans]
ORDER BY [monthlyPrice] ASC;

PRINT N'';
PRINT N'✅ 완료! 브라우저를 새로고침하세요.';
GO

