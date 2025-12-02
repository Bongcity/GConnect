-- Plans 테이블 생성
USE GCONNECT;
GO

-- Plans 테이블이 없으면 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Plans')
BEGIN
    CREATE TABLE Plans (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        displayName NVARCHAR(100) NOT NULL,
        description NVARCHAR(500),
        maxProducts INT NOT NULL,
        maxApiCalls INT,
        monthlyPrice INT NOT NULL,
        yearlyPrice INT,
        features NVARCHAR(MAX),
        isActive BIT NOT NULL DEFAULT 1,
        isPublic BIT NOT NULL DEFAULT 1,
        sortOrder INT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Plans 테이블 생성 완료';
END
ELSE
BEGIN
    PRINT 'ℹ️ Plans 테이블이 이미 존재합니다';
END
GO

-- UserSubscriptions 테이블이 없으면 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSubscriptions')
BEGIN
    -- Users 테이블의 id 컬럼 타입 확인
    DECLARE @userIdType NVARCHAR(50);
    SELECT @userIdType = t.name + '(' + CAST(c.max_length AS NVARCHAR(10)) + ')'
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('Users') AND c.name = 'id';
    
    PRINT '📋 Users.id 타입: ' + @userIdType;
    
    -- Users.id가 NVARCHAR(450)이면 그에 맞춰서 생성
    CREATE TABLE UserSubscriptions (
        id NVARCHAR(450) PRIMARY KEY,
        userId NVARCHAR(450) NOT NULL,
        planId NVARCHAR(255) NOT NULL,
        startDate DATETIME2 NOT NULL,
        endDate DATETIME2,
        status NVARCHAR(50) NOT NULL,
        paymentMethod NVARCHAR(50),
        paymentId NVARCHAR(200),
        currentProducts INT NOT NULL DEFAULT 0,
        autoRenew BIT NOT NULL DEFAULT 1,
        adminNote NVARCHAR(MAX),
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (planId) REFERENCES Plans(id)
    );
    
    CREATE INDEX IX_UserSubscriptions_userId ON UserSubscriptions(userId);
    CREATE INDEX IX_UserSubscriptions_planId ON UserSubscriptions(planId);
    CREATE INDEX IX_UserSubscriptions_status ON UserSubscriptions(status);
    
    PRINT '✅ UserSubscriptions 테이블 생성 완료';
END
ELSE
BEGIN
    PRINT 'ℹ️ UserSubscriptions 테이블이 이미 존재합니다';
END
GO

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '✅ 구독 관련 테이블 생성 완료!';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';
PRINT '다음 단계:';
PRINT '1. scripts/seed-test-subscription.sql 실행';
PRINT '   → 플랜 및 테스트 구독 생성';
PRINT '';

