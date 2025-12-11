-- SystemSettings 테이블 생성 (idempotent)
-- DDRo 상품 노출 제어 및 기타 시스템 전역 설정

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemSettings' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[SystemSettings] (
        [id] NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
        [showDdroProducts] BIT NOT NULL DEFAULT 1,
        [maintenanceMode] BIT NOT NULL DEFAULT 0,
        [maintenanceMessage] NVARCHAR(500) NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    PRINT '✅ SystemSettings 테이블 생성 완료';
    
    -- 초기 레코드 생성 (DDRo 상품 표시 ON, 유지보수 모드 OFF)
    INSERT INTO [dbo].[SystemSettings] ([id], [showDdroProducts], [maintenanceMode])
    VALUES (NEWID(), 1, 0);
    
    PRINT '✅ SystemSettings 초기 데이터 생성 완료';
END
ELSE
BEGIN
    PRINT 'ℹ️  SystemSettings 테이블이 이미 존재합니다';
END
GO

