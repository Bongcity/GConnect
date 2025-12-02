-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GConnect 구독 시스템 완전 초기화 및 테스트 데이터 생성
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE GCONNECT;
GO

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🔄 1단계: 기존 데이터 정리';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 1. 기존 구독 데이터 삭제 (외래 키 때문에 순서 중요)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSubscriptions')
BEGIN
    DROP TABLE UserSubscriptions;
    PRINT '✅ UserSubscriptions 테이블 삭제';
END

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Plans')
BEGIN
    DROP TABLE Plans;
    PRINT '✅ Plans 테이블 삭제';
END

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '📦 2단계: 테이블 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 2. Plans 테이블 생성
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
PRINT '✅ Plans 테이블 생성';

-- 3. UserSubscriptions 테이블 생성 (Users.id 타입에 맞춤)
-- Users.id의 실제 타입 확인 (NVARCHAR는 max_length가 바이트 단위이므로 2로 나눔)
DECLARE @userIdLength INT;
SELECT @userIdLength = c.max_length / 2
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('Users') AND c.name = 'id';

PRINT '📋 Users.id 길이: NVARCHAR(' + CAST(@userIdLength AS NVARCHAR(10)) + ')';

-- 동적 SQL로 테이블 생성 (Users.id와 동일한 길이 사용)
DECLARE @sql NVARCHAR(MAX);
SET @sql = N'
CREATE TABLE UserSubscriptions (
    id NVARCHAR(' + CAST(@userIdLength AS NVARCHAR(10)) + ') PRIMARY KEY,
    userId NVARCHAR(' + CAST(@userIdLength AS NVARCHAR(10)) + ') NOT NULL,
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
';

EXEC sp_executesql @sql;
PRINT '✅ UserSubscriptions 테이블 생성';

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🎯 3단계: 플랜 데이터 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 4. Starter 플랜
INSERT INTO Plans (id, name, displayName, description, maxProducts, maxApiCalls, monthlyPrice, yearlyPrice, features, isActive, isPublic, sortOrder, createdAt, updatedAt)
VALUES (
    'starter-plan-id',
    'STARTER',
    'Starter (10K)',
    '소규모 스토어를 위한 시작 플랜',
    10000,
    30000,
    300000,
    3240000,
    '["최대 10,000개 상품 동기화","월 30,000회 API 호출","기본 성과 분석","자동 동기화 스케줄러","이메일 알림"]',
    1,
    1,
    1,
    GETDATE(),
    GETDATE()
);
PRINT '✅ Starter 플랜 생성';

-- 5. Pro 플랜
INSERT INTO Plans (id, name, displayName, description, maxProducts, maxApiCalls, monthlyPrice, yearlyPrice, features, isActive, isPublic, sortOrder, createdAt, updatedAt)
VALUES (
    'pro-plan-id',
    'PRO',
    'Pro (50K)',
    '중소형 스토어를 위한 프로 플랜',
    50000,
    100000,
    800000,
    8640000,
    '["최대 50,000개 상품 동기화","월 100,000회 API 호출","고급 성과 분석","자동 동기화 스케줄러","이메일 알림","우선 고객 지원"]',
    1,
    1,
    2,
    GETDATE(),
    GETDATE()
);
PRINT '✅ Pro 플랜 생성';

-- 6. Enterprise 플랜
INSERT INTO Plans (id, name, displayName, description, maxProducts, maxApiCalls, monthlyPrice, yearlyPrice, features, isActive, isPublic, sortOrder, createdAt, updatedAt)
VALUES (
    'enterprise-plan-id',
    'ENTERPRISE',
    'Enterprise (50K+)',
    '대형 스토어를 위한 엔터프라이즈 플랜',
    999999,
    999999,
    0,
    0,
    '["무제한 상품 동기화","무제한 API 호출","프리미엄 성과 분석","자동 동기화 스케줄러","웹훅 연동 (Slack, Discord 등)","전담 고객 지원","맞춤형 기능 개발"]',
    1,
    1,
    3,
    GETDATE(),
    GETDATE()
);
PRINT '✅ Enterprise 플랜 생성';

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '👤 4단계: 테스트 사용자 생성/확인';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 7. test@seller.com 사용자 찾기 또는 생성
-- Users.id와 동일한 길이 사용 (NVARCHAR(1000))
DECLARE @userId NVARCHAR(1000);
SELECT @userId = id FROM Users WHERE email = 'test@seller.com';

IF @userId IS NULL
BEGIN
    SET @userId = CONVERT(NVARCHAR(450), NEWID());
    INSERT INTO Users (
        id, email, name, shopName, shopStatus, 
        naverShopUrl, naverShopId, phone, naverApiEnabled,
        createdAt, updatedAt
    )
    VALUES (
        @userId,
        'test@seller.com',
        N'테스트 샐러',
        N'GConnect 테스트샵',
        'ACTIVE',
        'https://smartstore.naver.com/gconnect-test',
        'gconnect-test',
        '010-1234-5678',
        1,
        GETDATE(),
        GETDATE()
    );
    PRINT '✅ test@seller.com 사용자 생성';
END
ELSE
BEGIN
    PRINT '✅ test@seller.com 사용자 확인 (기존)';
END

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '💳 5단계: 테스트 구독 생성 (5일 후 만료)';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 8. 현재 상품 수 조회
DECLARE @productCount INT;
SELECT @productCount = COUNT(*) FROM affiliate_products WHERE userId = @userId;

-- 9. 5일 후 만료되는 Pro 구독 생성
DECLARE @startDate DATETIME2 = DATEADD(MONTH, -1, GETDATE());
DECLARE @endDate DATETIME2 = DATEADD(DAY, 5, GETDATE());

INSERT INTO UserSubscriptions (
    id, userId, planId, startDate, endDate, status, 
    paymentMethod, paymentId, currentProducts, autoRenew, 
    adminNote, createdAt, updatedAt
)
VALUES (
    NEWID(),
    @userId,
    'pro-plan-id',
    @startDate,
    @endDate,
    'ACTIVE',
    'MANUAL',
    'TEST_PAYMENT_' + CONVERT(NVARCHAR(50), GETDATE(), 120),
    @productCount,
    1,
    '테스트용 구독 (5일 후 만료)',
    GETDATE(),
    GETDATE()
);
PRINT '✅ Pro 플랜 구독 생성 (5일 후 만료)';

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '📦 6단계: 테스트 상품 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 10. 기존 테스트 상품 삭제
DELETE FROM affiliate_products WHERE userId = @userId;
PRINT '🗑️  기존 테스트 상품 삭제';

-- 11. 테스트 상품 6개 생성 (id는 IDENTITY로 자동 생성)
SET IDENTITY_INSERT affiliate_products OFF;

INSERT INTO affiliate_products (userId, store_name, brand_store, store_status, product_name, product_status, sale_price, discounted_sale_price, discounted_rate, representative_product_image_url, product_url, enabled, created_at, updated_at)
VALUES 
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 프리미엄 무선 이어폰 Pro Max', 'SALE', 159000, 129000, 18.9, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds', 'https://smartstore.naver.com/gconnect-test/products/1001', 1, GETDATE(), GETDATE()),
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 스마트워치 Ultra 2024', 'SALE', 289000, 219000, 24.2, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch', 'https://smartstore.naver.com/gconnect-test/products/1002', 1, GETDATE(), GETDATE()),
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 여행용 프리미엄 백팩 35L', 'SALE', 89000, 69900, 21.5, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack', 'https://smartstore.naver.com/gconnect-test/products/1003', 1, GETDATE(), GETDATE()),
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 게이밍 기계식 키보드 RGB', 'SALE', 149000, NULL, NULL, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard', 'https://smartstore.naver.com/gconnect-test/products/1004', 1, GETDATE(), GETDATE()),
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 포터블 블루투스 스피커 20W', 'SALE', 79000, 59900, 24.2, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker', 'https://smartstore.naver.com/gconnect-test/products/1005', 1, GETDATE(), GETDATE()),
(@userId, N'GConnect 테스트샵', 1, 'ACTIVE', N'GConnect 프리미엄 아라비카 원두 1kg', 'SALE', 45000, 35900, 20.2, 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans', 'https://smartstore.naver.com/gconnect-test/products/1006', 1, GETDATE(), GETDATE());

PRINT '✅ 테스트 상품 6개 생성';

-- 12. 구독 정보에 상품 수 업데이트
UPDATE UserSubscriptions 
SET currentProducts = 6 
WHERE userId = @userId;

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '✅ 완료! 결과 확인';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';

-- 13. 결과 확인
SELECT 
    u.email AS [이메일],
    u.shopName AS [샵명],
    p.displayName AS [플랜],
    us.startDate AS [시작일],
    us.endDate AS [종료일],
    DATEDIFF(DAY, GETDATE(), us.endDate) AS [남은일수],
    us.status AS [상태],
    us.currentProducts AS [현재상품],
    p.maxProducts AS [최대상품],
    us.autoRenew AS [자동갱신]
FROM Users u
LEFT JOIN UserSubscriptions us ON u.id = us.userId
LEFT JOIN Plans p ON us.planId = p.id
WHERE u.email = 'test@seller.com';

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🎉 테스트 환경 준비 완료!';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';
PRINT '📧 이메일: test@seller.com';
PRINT '📦 플랜: Pro (50K)';
PRINT '⏰ 만료: 5일 후';
PRINT '🛍️  상품: 6개';
PRINT '';
PRINT '🔗 로그인: http://localhost:3003/login';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';

