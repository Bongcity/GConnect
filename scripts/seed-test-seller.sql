-- GConnect 테스트 SELLER 및 상품 데이터 생성
-- GCONNECT DB용 (현재 스키마에 맞춤)

USE GCONNECT;
GO

-- 1. 테스트 SELLER 사용자 생성
DECLARE @userId NVARCHAR(450) = CONVERT(NVARCHAR(450), NEWID());

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'test@seller.com')
BEGIN
    INSERT INTO Users (
        id, 
        email, 
        name, 
        shopName, 
        shopStatus, 
        naverShopUrl,
        naverShopId,
        phone,
        naverApiEnabled,
        createdAt, 
        updatedAt
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
    
    PRINT N'✅ 테스트 SELLER 생성 완료: ' + @userId;
END
ELSE
BEGIN
    SELECT @userId = id FROM Users WHERE email = 'test@seller.com';
    PRINT N'ℹ️ 기존 테스트 SELLER 사용: ' + @userId;
END

-- 2. 테스트 상품 생성 (affiliate_products 테이블 사용)
-- 상품 1: 프리미엄 무선 이어폰
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%무선 이어폰%')
BEGIN
    INSERT INTO affiliate_products (
        id,
        userId,
        store_name,
        brand_store,
        store_status,
        product_name,
        product_status,
        sale_price,
        discounted_sale_price,
        discounted_rate,
        representative_product_image_url,
        product_url,
        enabled,
        created_at,
        updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq,
        @userId,
        N'GConnect 테스트샵',
        1,
        'ACTIVE',
        N'GConnect 프리미엄 무선 이어폰 Pro Max',
        'SALE',
        159000,
        129000,
        18.9,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds',
        'https://smartstore.naver.com/gconnect-test/products/1001',
        1,
        GETDATE(),
        GETDATE()
    );
    PRINT N'✅ 상품 1 생성: 프리미엄 무선 이어폰';
END

-- 상품 2: 스마트워치
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%스마트워치%')
BEGIN
    INSERT INTO affiliate_products (
        id, userId, store_name, brand_store, store_status,
        product_name, product_status, sale_price, discounted_sale_price, discounted_rate,
        representative_product_image_url, product_url, enabled, created_at, updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq, @userId,
        N'GConnect 테스트샵', 1, 'ACTIVE',
        N'GConnect 스마트워치 Ultra 2024', 'SALE',
        289000, 219000, 24.2,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch',
        'https://smartstore.naver.com/gconnect-test/products/1002',
        1, GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 2 생성: 스마트워치';
END

-- 상품 3: 프리미엄 백팩
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%백팩%')
BEGIN
    INSERT INTO affiliate_products (
        id, userId, store_name, brand_store, store_status,
        product_name, product_status, sale_price, discounted_sale_price, discounted_rate,
        representative_product_image_url, product_url, enabled, created_at, updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq, @userId,
        N'GConnect 테스트샵', 1, 'ACTIVE',
        N'GConnect 여행용 프리미엄 백팩 35L', 'SALE',
        89000, 69900, 21.5,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack',
        'https://smartstore.naver.com/gconnect-test/products/1003',
        1, GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 3 생성: 프리미엄 백팩';
END

-- 상품 4: 기계식 키보드
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%키보드%')
BEGIN
    INSERT INTO affiliate_products (
        id, userId, store_name, brand_store, store_status,
        product_name, product_status, sale_price,
        representative_product_image_url, product_url, enabled, created_at, updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq, @userId,
        N'GConnect 테스트샵', 1, 'ACTIVE',
        N'GConnect 게이밍 기계식 키보드 RGB', 'SALE',
        149000,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard',
        'https://smartstore.naver.com/gconnect-test/products/1004',
        1, GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 4 생성: 기계식 키보드';
END

-- 상품 5: 블루투스 스피커
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%스피커%')
BEGIN
    INSERT INTO affiliate_products (
        id, userId, store_name, brand_store, store_status,
        product_name, product_status, sale_price, discounted_sale_price, discounted_rate,
        representative_product_image_url, product_url, enabled, created_at, updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq, @userId,
        N'GConnect 테스트샵', 1, 'ACTIVE',
        N'GConnect 포터블 블루투스 스피커 20W', 'SALE',
        79000, 59900, 24.2,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker',
        'https://smartstore.naver.com/gconnect-test/products/1005',
        1, GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 5 생성: 블루투스 스피커';
END

-- 상품 6: 프리미엄 커피 원두
IF NOT EXISTS (SELECT 1 FROM affiliate_products WHERE userId = @userId AND product_name LIKE N'%커피%')
BEGIN
    INSERT INTO affiliate_products (
        id, userId, store_name, brand_store, store_status,
        product_name, product_status, sale_price, discounted_sale_price, discounted_rate,
        representative_product_image_url, product_url, enabled, created_at, updated_at
    )
    VALUES (
        NEXT VALUE FOR affiliate_products_seq, @userId,
        N'GConnect 테스트샵', 1, 'ACTIVE',
        N'GConnect 프리미엄 아라비카 원두 1kg', 'SALE',
        45000, 35900, 20.2,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans',
        'https://smartstore.naver.com/gconnect-test/products/1006',
        1, GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 6 생성: 프리미엄 커피 원두';
END

-- 결과 확인
SELECT 
    u.shopName,
    COUNT(p.id) AS ProductCount,
    MIN(p.sale_price) AS MinPrice,
    MAX(p.sale_price) AS MaxPrice
FROM Users u
LEFT JOIN affiliate_products p ON u.id = p.userId
WHERE u.email = 'test@seller.com'
GROUP BY u.shopName;

PRINT N'';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'✅ 테스트 데이터 생성 완료!';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'📧 SELLER: test@seller.com';
PRINT N'🏪 샵명: GConnect 테스트샵';
PRINT N'📦 상품 개수: 6개';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';
PRINT N'다음 단계:';
PRINT N'1. 로그인: http://localhost:3003/login';
PRINT N'2. test@seller.com / (비밀번호 설정 필요)';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

