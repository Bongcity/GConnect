-- Inquiries 테이블 생성
-- GConnect 셀러 문의하기 기능

-- 0. Users 테이블의 id 컬럼 타입 확인
DECLARE @UserIdType NVARCHAR(50);
DECLARE @UserIdMaxLength INT;

SELECT 
    @UserIdType = TYPE_NAME(c.user_type_id),
    @UserIdMaxLength = c.max_length
FROM 
    sys.columns c
WHERE 
    c.object_id = OBJECT_ID('dbo.Users')
    AND c.name = 'id';

PRINT 'Users.id 타입: ' + @UserIdType + '(' + CAST(@UserIdMaxLength AS NVARCHAR) + ')';

-- 1. 기존 Inquiries 테이블 삭제 (있다면)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inquiries]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Inquiries];
    PRINT '기존 Inquiries 테이블 삭제 완료';
END

-- 2. 테이블 생성 (Users.id와 동일한 타입 사용)
IF @UserIdType = 'uniqueidentifier'
BEGIN
    -- UNIQUEIDENTIFIER 타입으로 생성
    CREATE TABLE [dbo].[Inquiries] (
        [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [userId] UNIQUEIDENTIFIER NOT NULL,
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
        
        CONSTRAINT [PK_Inquiries] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_Inquiries_Users] FOREIGN KEY ([userId]) 
            REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE
    );
    PRINT 'Inquiries 테이블 생성 완료 (UNIQUEIDENTIFIER)';
END
ELSE
BEGIN
    -- NVARCHAR 타입으로 생성 (Users.id와 동일한 길이)
    DECLARE @Sql NVARCHAR(MAX);
    SET @Sql = N'
    CREATE TABLE [dbo].[Inquiries] (
        [id] NVARCHAR(' + CAST(@UserIdMaxLength/2 AS NVARCHAR) + ') NOT NULL,
        [userId] NVARCHAR(' + CAST(@UserIdMaxLength/2 AS NVARCHAR) + ') NOT NULL,
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
        
        CONSTRAINT [PK_Inquiries] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_Inquiries_Users] FOREIGN KEY ([userId]) 
            REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE
    );';
    
    EXEC sp_executesql @Sql;
    PRINT 'Inquiries 테이블 생성 완료 (NVARCHAR(' + CAST(@UserIdMaxLength/2 AS NVARCHAR) + '))';
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

