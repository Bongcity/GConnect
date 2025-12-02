-- 1. 플랜 생성 (이미 있으면 무시)
IF NOT EXISTS (SELECT 1 FROM Plans WHERE name = 'STARTER')
BEGIN
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
END

IF NOT EXISTS (SELECT 1 FROM Plans WHERE name = 'PRO')
BEGIN
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
END

IF NOT EXISTS (SELECT 1 FROM Plans WHERE name = 'ENTERPRISE')
BEGIN
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
END

-- 2. test@seller.com 사용자 찾기
DECLARE @userId NVARCHAR(450);
SELECT @userId = id FROM Users WHERE email = 'test@seller.com';

IF @userId IS NULL
BEGIN
    PRINT '❌ test@seller.com 사용자를 찾을 수 없습니다.';
    PRINT '먼저 Seller 사이트에서 회원가입을 해주세요.';
END
ELSE
BEGIN
    -- 3. 기존 구독 삭제
    DELETE FROM UserSubscriptions WHERE userId = @userId;
    
    -- 4. 현재 상품 수 조회
    DECLARE @productCount INT;
    SELECT @productCount = COUNT(*) FROM affiliate_products WHERE userId = @userId;
    
    -- 5. 5일 후 만료되는 Pro 구독 생성
    DECLARE @startDate DATETIME = DATEADD(MONTH, -1, GETDATE());
    DECLARE @endDate DATETIME = DATEADD(DAY, 5, GETDATE());
    
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
        'TEST_PAYMENT_' + CAST(GETDATE() AS NVARCHAR(50)),
        @productCount,
        1,
        '테스트용 구독 (5일 후 만료)',
        GETDATE(),
        GETDATE()
    );
    
    PRINT '✅ 구독 생성 완료!';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '📧 사용자: test@seller.com';
    PRINT '📦 플랜: Pro (50K)';
    PRINT '📅 시작일: ' + CONVERT(NVARCHAR(50), @startDate, 120);
    PRINT '📅 종료일: ' + CONVERT(NVARCHAR(50), @endDate, 120);
    PRINT '⏰ 남은 기간: 5일';
    PRINT '📊 현재 상품 수: ' + CAST(@productCount AS NVARCHAR(50));
    PRINT '📊 최대 상품 수: 50000';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '🎉 테스트 준비 완료! Seller 사이트에서 확인하세요.';
    PRINT '🔗 http://localhost:3003/dashboard';
END

-- 결과 확인
SELECT 
    u.email,
    p.displayName AS 플랜,
    us.startDate AS 시작일,
    us.endDate AS 종료일,
    DATEDIFF(DAY, GETDATE(), us.endDate) AS 남은일수,
    us.status AS 상태,
    us.currentProducts AS 현재상품수,
    p.maxProducts AS 최대상품수
FROM UserSubscriptions us
JOIN Users u ON us.userId = u.id
JOIN Plans p ON us.planId = p.id
WHERE u.email = 'test@seller.com';

