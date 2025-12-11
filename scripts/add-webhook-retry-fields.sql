-- Webhook 테이블에 재시도 설정 필드 추가
-- 
-- 이 스크립트는 기존 Webhooks 테이블에 재시도 관련 컬럼을 추가합니다.
-- idempotent: 이미 컬럼이 존재하면 건너뜁니다.

-- retryEnabled 컬럼 추가
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('dbo.Webhooks') 
  AND name = 'retryEnabled'
)
BEGIN
  ALTER TABLE dbo.Webhooks
  ADD retryEnabled BIT NOT NULL DEFAULT 0;
  
  PRINT '✅ Webhooks.retryEnabled 컬럼 추가 완료';
END
ELSE
BEGIN
  PRINT 'ℹ️ Webhooks.retryEnabled 컬럼이 이미 존재합니다';
END
GO

-- maxRetries 컬럼 추가
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('dbo.Webhooks') 
  AND name = 'maxRetries'
)
BEGIN
  ALTER TABLE dbo.Webhooks
  ADD maxRetries INT NOT NULL DEFAULT 3;
  
  PRINT '✅ Webhooks.maxRetries 컬럼 추가 완료';
END
ELSE
BEGIN
  PRINT 'ℹ️ Webhooks.maxRetries 컬럼이 이미 존재합니다';
END
GO

-- retryDelay 컬럼 추가
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('dbo.Webhooks') 
  AND name = 'retryDelay'
)
BEGIN
  ALTER TABLE dbo.Webhooks
  ADD retryDelay INT NOT NULL DEFAULT 5;
  
  PRINT '✅ Webhooks.retryDelay 컬럼 추가 완료';
END
ELSE
BEGIN
  PRINT 'ℹ️ Webhooks.retryDelay 컬럼이 이미 존재합니다';
END
GO

PRINT '';
PRINT '========================================';
PRINT '웹훅 재시도 설정 필드 마이그레이션 완료';
PRINT '========================================';
PRINT '';
PRINT '추가된 컬럼:';
PRINT '  - retryEnabled: BIT (기본값: 0)';
PRINT '  - maxRetries: INT (기본값: 3)';
PRINT '  - retryDelay: INT (기본값: 5초)';
PRINT '';
GO

