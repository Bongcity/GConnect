-- Inquiries 테이블 생성
-- GConnect 셀러 문의하기 기능

-- 1. 테이블이 이미 존재하는지 확인
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inquiries]') AND type in (N'U'))
BEGIN
    -- 테이블 생성
    CREATE TABLE [dbo].[Inquiries] (
        [id] NVARCHAR(450) NOT NULL,
        [userId] NVARCHAR(450) NOT NULL,
        [title] NVARCHAR(200) NOT NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [category] NVARCHAR(50) NOT NULL,
        [status] NVARCHAR(50) NOT NULL,
        [userEmail] NVARCHAR(255) NOT NULL,
        [userName] NVARCHAR(100) NOT NULL,
        [userShopName] NVARCHAR(200),
        [adminReply] NVARCHAR(MAX),
        [adminName] NVARCHAR(100),
        [repliedAt] DATETIME2,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        -- Primary Key
        CONSTRAINT [PK_Inquiries] PRIMARY KEY CLUSTERED ([id] ASC),
        
        -- Foreign Key
        CONSTRAINT [FK_Inquiries_Users] FOREIGN KEY ([userId]) 
            REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE
    );
    
    PRINT 'Inquiries 테이블 생성 완료';
END
ELSE
BEGIN
    PRINT 'Inquiries 테이블이 이미 존재합니다';
END
GO

-- 2. 인덱스 생성
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inquiries_userId' AND object_id = OBJECT_ID(N'[dbo].[Inquiries]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Inquiries_userId] ON [dbo].[Inquiries]([userId] ASC);
    PRINT '인덱스 IX_Inquiries_userId 생성 완료';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inquiries_status' AND object_id = OBJECT_ID(N'[dbo].[Inquiries]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Inquiries_status] ON [dbo].[Inquiries]([status] ASC);
    PRINT '인덱스 IX_Inquiries_status 생성 완료';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inquiries_category' AND object_id = OBJECT_ID(N'[dbo].[Inquiries]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Inquiries_category] ON [dbo].[Inquiries]([category] ASC);
    PRINT '인덱스 IX_Inquiries_category 생성 완료';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inquiries_createdAt' AND object_id = OBJECT_ID(N'[dbo].[Inquiries]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Inquiries_createdAt] ON [dbo].[Inquiries]([createdAt] ASC);
    PRINT '인덱스 IX_Inquiries_createdAt 생성 완료';
END
GO

-- 3. 테이블 확인
SELECT 
    'Inquiries' AS TableName,
    COUNT(*) AS RecordCount
FROM [dbo].[Inquiries];
GO

PRINT '모든 작업 완료!';

