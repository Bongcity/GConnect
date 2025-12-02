-- ============================================
-- GConnect Admin 기능 추가 마이그레이션
-- ============================================

USE GCONNECT;
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 1단계: 결제 내역 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments')
BEGIN
    CREATE TABLE Payments (
        id NVARCHAR(450) PRIMARY KEY,
        subscriptionId NVARCHAR(450) NOT NULL,
        userId NVARCHAR(450) NOT NULL,
        
        -- 결제 정보
        amount INT NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'KRW',
        method NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        
        -- 외부 결제 시스템
        transactionId NVARCHAR(200),
        paymentGateway NVARCHAR(50),
        
        -- 환불 정보
        refundReason NVARCHAR(500),
        refundedAt DATETIME2,
        refundedBy NVARCHAR(450),
        
        -- 메타데이터
        metadata NVARCHAR(MAX),
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (subscriptionId) REFERENCES UserSubscriptions(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Payments_subscriptionId ON Payments(subscriptionId);
    CREATE INDEX IX_Payments_userId ON Payments(userId);
    CREATE INDEX IX_Payments_status ON Payments(status);
    CREATE INDEX IX_Payments_createdAt ON Payments(createdAt);
    
    PRINT '✅ Payments 테이블 생성 완료';
END
ELSE
    PRINT '⏭️  Payments 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 2단계: FAQ 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FAQs')
BEGIN
    CREATE TABLE FAQs (
        id NVARCHAR(450) PRIMARY KEY,
        category NVARCHAR(100) NOT NULL,
        question NVARCHAR(500) NOT NULL,
        answer NVARCHAR(MAX) NOT NULL,
        isPublic BIT NOT NULL DEFAULT 1,
        sortOrder INT NOT NULL DEFAULT 0,
        viewCount INT NOT NULL DEFAULT 0,
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_FAQs_category ON FAQs(category);
    CREATE INDEX IX_FAQs_isPublic ON FAQs(isPublic);
    CREATE INDEX IX_FAQs_sortOrder ON FAQs(sortOrder);
    
    PRINT '✅ FAQs 테이블 생성 완료';
END
ELSE
    PRINT '⏭️  FAQs 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 3단계: 공지사항 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Announcements')
BEGIN
    CREATE TABLE Announcements (
        id NVARCHAR(450) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        isPinned BIT NOT NULL DEFAULT 0,
        isPublic BIT NOT NULL DEFAULT 1,
        startDate DATETIME2,
        endDate DATETIME2,
        viewCount INT NOT NULL DEFAULT 0,
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_Announcements_isPinned ON Announcements(isPinned);
    CREATE INDEX IX_Announcements_isPublic ON Announcements(isPublic);
    CREATE INDEX IX_Announcements_createdAt ON Announcements(createdAt);
    
    PRINT '✅ Announcements 테이블 생성 완료';
END
ELSE
    PRINT '⏭️  Announcements 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 4단계: 문의 답변 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InquiryResponses')
BEGIN
    CREATE TABLE InquiryResponses (
        id NVARCHAR(450) PRIMARY KEY,
        inquiryId INT NOT NULL,
        adminId NVARCHAR(450) NOT NULL,
        adminName NVARCHAR(100) NOT NULL,
        response NVARCHAR(MAX) NOT NULL,
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (inquiryId) REFERENCES IRInquiries(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_InquiryResponses_inquiryId ON InquiryResponses(inquiryId);
    
    PRINT '✅ InquiryResponses 테이블 생성 완료';
END
ELSE
    PRINT '⏭️  InquiryResponses 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 5단계: 관리자 알림 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AdminNotifications')
BEGIN
    CREATE TABLE AdminNotifications (
        id NVARCHAR(450) PRIMARY KEY,
        type NVARCHAR(50) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(1000) NOT NULL,
        severity NVARCHAR(20) NOT NULL,
        isRead BIT NOT NULL DEFAULT 0,
        link NVARCHAR(500),
        metadata NVARCHAR(MAX),
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_AdminNotifications_type ON AdminNotifications(type);
    CREATE INDEX IX_AdminNotifications_isRead ON AdminNotifications(isRead);
    CREATE INDEX IX_AdminNotifications_createdAt ON AdminNotifications(createdAt);
    
    PRINT '✅ AdminNotifications 테이블 생성 완료';
END
ELSE
    PRINT '⏭️  AdminNotifications 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 6단계: 알림 설정 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NotificationSettings')
BEGIN
    CREATE TABLE NotificationSettings (
        id NVARCHAR(450) PRIMARY KEY,
        
        -- 알림 활성화 여부
        syncFailureEnabled BIT NOT NULL DEFAULT 1,
        paymentFailureEnabled BIT NOT NULL DEFAULT 1,
        planExpiryEnabled BIT NOT NULL DEFAULT 1,
        inquiryEnabled BIT NOT NULL DEFAULT 1,
        
        -- 이메일 알림
        emailEnabled BIT NOT NULL DEFAULT 0,
        emailAddress NVARCHAR(255),
        
        -- 웹훅 연동
        slackWebhook NVARCHAR(500),
        discordWebhook NVARCHAR(500),
        
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    PRINT '✅ NotificationSettings 테이블 생성 완료';
    
    -- 기본 설정 레코드 생성
    INSERT INTO NotificationSettings (id, syncFailureEnabled, paymentFailureEnabled, planExpiryEnabled, inquiryEnabled)
    VALUES (NEWID(), 1, 1, 1, 1);
    
    PRINT '✅ 기본 알림 설정 생성 완료';
END
ELSE
    PRINT '⏭️  NotificationSettings 테이블이 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 7단계: 테스트 데이터 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- FAQ 테스트 데이터
IF NOT EXISTS (SELECT * FROM FAQs)
BEGIN
    INSERT INTO FAQs (id, category, question, answer, isPublic, sortOrder) VALUES
    (NEWID(), '사용법', 'GConnect는 어떻게 사용하나요?', '네이버 스마트스토어 API를 연동하고 상품을 가져온 후 Google Shopping에 자동으로 노출시킬 수 있습니다.', 1, 1),
    (NEWID(), '사용법', '상품은 어떻게 등록하나요?', '상품 관리 페이지에서 "네이버 상품 가져오기" 버튼을 클릭하여 네이버 스마트스토어의 상품을 가져올 수 있습니다.', 1, 2),
    (NEWID(), '요금', '플랜은 어떻게 변경하나요?', '구독 관리 페이지에서 원하는 플랜을 선택하고 업그레이드할 수 있습니다.', 1, 3),
    (NEWID(), '요금', '환불은 가능한가요?', '구독 후 7일 이내 사용하지 않은 경우 전액 환불이 가능합니다.', 1, 4),
    (NEWID(), '기술지원', 'API 연동이 안돼요', '네이버 개발자 센터에서 API 키를 확인하고 올바르게 입력했는지 확인해주세요.', 1, 5);
    
    PRINT '✅ FAQ 테스트 데이터 생성 완료 (5개)';
END
ELSE
    PRINT '⏭️  FAQ 데이터가 이미 존재합니다';
GO

-- 공지사항 테스트 데이터
IF NOT EXISTS (SELECT * FROM Announcements)
BEGIN
    INSERT INTO Announcements (id, title, content, isPinned, isPublic, startDate) VALUES
    (NEWID(), '[중요] GConnect 정식 서비스 오픈', 'GConnect가 정식으로 서비스를 시작합니다. 많은 이용 부탁드립니다!', 1, 1, GETDATE()),
    (NEWID(), '신규 기능 업데이트 안내', 'Google Shopping 피드 자동 생성 기능이 추가되었습니다.', 0, 1, GETDATE()),
    (NEWID(), '서버 점검 안내', '2025년 1월 1일 새벽 2시~4시 서버 점검이 있을 예정입니다.', 0, 1, GETDATE());
    
    PRINT '✅ 공지사항 테스트 데이터 생성 완료 (3개)';
END
ELSE
    PRINT '⏭️  공지사항 데이터가 이미 존재합니다';
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '✅ 마이그레이션 완료!';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
GO

