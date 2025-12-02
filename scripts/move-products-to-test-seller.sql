-- affiliate_products의 모든 상품을 test@seller.com으로 이동
USE GCONNECT;
GO

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '📦 상품 소유자 변경 시작';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';

-- 1. test@seller.com 사용자 ID 찾기
DECLARE @testUserId NVARCHAR(1000);
SELECT @testUserId = id FROM Users WHERE email = 'test@seller.com';

IF @testUserId IS NULL
BEGIN
    PRINT '❌ test@seller.com 사용자를 찾을 수 없습니다.';
    PRINT '먼저 scripts/reset-and-setup-all.sql을 실행하세요.';
END
ELSE
BEGIN
    -- 2. 현재 상품 수 확인
    DECLARE @totalProducts INT;
    SELECT @totalProducts = COUNT(*) FROM affiliate_products;
    
    DECLARE @testUserProducts INT;
    SELECT @testUserProducts = COUNT(*) FROM affiliate_products WHERE userId = @testUserId;
    
    PRINT '📊 현재 상황:';
    PRINT '   - 전체 상품 수: ' + CAST(@totalProducts AS NVARCHAR(10));
    PRINT '   - test@seller.com 상품 수: ' + CAST(@testUserProducts AS NVARCHAR(10));
    PRINT '   - 이동할 상품 수: ' + CAST(@totalProducts - @testUserProducts AS NVARCHAR(10));
    PRINT '';
    
    -- 3. 모든 상품을 test@seller.com으로 이동
    UPDATE affiliate_products
    SET userId = @testUserId,
        store_name = N'GConnect 테스트샵',
        updated_at = GETDATE()
    WHERE userId != @testUserId;
    
    DECLARE @movedCount INT = @@ROWCOUNT;
    PRINT '✅ ' + CAST(@movedCount AS NVARCHAR(10)) + '개 상품 이동 완료';
    
    -- 4. 구독 정보의 currentProducts 업데이트
    DECLARE @newProductCount INT;
    SELECT @newProductCount = COUNT(*) FROM affiliate_products WHERE userId = @testUserId;
    
    UPDATE UserSubscriptions
    SET currentProducts = @newProductCount
    WHERE userId = @testUserId;
    
    PRINT '✅ 구독 정보 업데이트 (상품 수: ' + CAST(@newProductCount AS NVARCHAR(10)) + ')';
    
    PRINT '';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '✅ 완료! 결과 확인';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '';
    
    -- 5. 결과 확인
    SELECT 
        u.email AS [이메일],
        u.shopName AS [샵명],
        p.displayName AS [플랜],
        COUNT(ap.id) AS [상품수],
        us.currentProducts AS [구독상품수],
        p.maxProducts AS [최대상품],
        DATEDIFF(DAY, GETDATE(), us.endDate) AS [남은일수]
    FROM Users u
    LEFT JOIN affiliate_products ap ON u.id = ap.userId
    LEFT JOIN UserSubscriptions us ON u.id = us.userId
    LEFT JOIN Plans p ON us.planId = p.id
    WHERE u.email = 'test@seller.com'
    GROUP BY u.email, u.shopName, p.displayName, us.currentProducts, p.maxProducts, us.endDate;
    
    PRINT '';
    PRINT '🔗 로그인: http://localhost:3003/login';
    PRINT '📧 이메일: test@seller.com';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '';
END

