-- GConnect 테스트 SELLER 및 상품 데이터 생성
-- GCONNECT DB용

USE GCONNECT;
GO

-- 1. 테스트 SELLER 사용자 생성
DECLARE @userId NVARCHAR(50) = CONVERT(NVARCHAR(50), NEWID());

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'test.seller@gconnect.co.kr')
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
        'test.seller@gconnect.co.kr',
        N'테스트 셀러',
        N'GConnect 공식 테스트샵',
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
    SELECT @userId = id FROM Users WHERE email = 'test.seller@gconnect.co.kr';
    PRINT N'ℹ️ 기존 테스트 SELLER 사용: ' + @userId;
END

-- 2. 테스트 상품 생성
-- 상품 1: 프리미엄 무선 이어폰
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%무선 이어폰%')
BEGIN
    INSERT INTO Products (
        id,
        userId,
        name,
        description,
        price,
        salePrice,
        stockQuantity,
        imageUrl,
        thumbnailUrl,
        category1,
        category2,
        category3,
        categoryPath,
        isActive,
        isGoogleExposed,
        googleUrl,
        syncStatus,
        createdAt,
        updatedAt
    )
    VALUES (
        NEWID(),
        @userId,
        N'GConnect 프리미엄 무선 이어폰 Pro Max',
        N'최고급 음질과 노이즈 캔슬링 기능을 탑재한 프리미엄 무선 이어폰입니다. 30시간 장시간 재생, IPX7 방수 등급, 초고속 충전 지원',
        159000,
        129000,
        50,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds',
        N'전자기기',
        N'오디오',
        N'이어폰',
        N'전자기기 > 오디오 > 이어폰',
        1,
        1,
        'https://smartstore.naver.com/gconnect-test/products/1001',
        'SYNCED',
        GETDATE(),
        GETDATE()
    );
    PRINT N'✅ 상품 1 생성: 프리미엄 무선 이어폰';
END

-- 상품 2: 스마트워치
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%스마트워치%')
BEGIN
    INSERT INTO Products (
        id, userId, name, description, price, salePrice, stockQuantity,
        imageUrl, thumbnailUrl, category1, category2, category3, categoryPath,
        isActive, isGoogleExposed, googleUrl, syncStatus, createdAt, updatedAt
    )
    VALUES (
        NEWID(), @userId,
        N'GConnect 스마트워치 Ultra 2024',
        N'건강관리부터 운동까지! 심박수, 산소포화도, 수면 측정 기능이 있는 프리미엄 스마트워치입니다. 5일 배터리, 50m 방수',
        289000, 219000, 30,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch',
        N'전자기기', N'웨어러블', N'스마트워치',
        N'전자기기 > 웨어러블 > 스마트워치',
        1, 1,
        'https://smartstore.naver.com/gconnect-test/products/1002',
        'SYNCED', GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 2 생성: 스마트워치';
END

-- 상품 3: 프리미엄 백팩
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%백팩%')
BEGIN
    INSERT INTO Products (
        id, userId, name, description, price, salePrice, stockQuantity,
        imageUrl, thumbnailUrl, category1, category2, category3, categoryPath,
        isActive, isGoogleExposed, googleUrl, syncStatus, createdAt, updatedAt
    )
    VALUES (
        NEWID(), @userId,
        N'GConnect 여행용 프리미엄 백팩 35L',
        N'출장과 여행을 위한 완벽한 백팩! USB 충전 포트, 도난 방지 디자인, 15.6인치 노트북 수납 가능. 방수 소재 사용',
        89000, 69900, 100,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack',
        N'패션', N'가방', N'백팩',
        N'패션 > 가방 > 백팩',
        1, 1,
        'https://smartstore.naver.com/gconnect-test/products/1003',
        'SYNCED', GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 3 생성: 프리미엄 백팩';
END

-- 상품 4: 기계식 키보드
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%키보드%')
BEGIN
    INSERT INTO Products (
        id, userId, name, description, price, salePrice, stockQuantity,
        imageUrl, thumbnailUrl, category1, category2, category3, categoryPath,
        isActive, isGoogleExposed, googleUrl, syncStatus, createdAt, updatedAt
    )
    VALUES (
        NEWID(), @userId,
        N'GConnect 게이밍 기계식 키보드 RGB',
        N'정확한 타이핑감의 청축 스위치, 화려한 RGB 라이팅, N키 롤오버 지원. 게이머와 개발자를 위한 최적의 키보드',
        149000, NULL, 80,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard',
        N'전자기기', N'컴퓨터 주변기기', N'키보드',
        N'전자기기 > 컴퓨터 주변기기 > 키보드',
        1, 1,
        'https://smartstore.naver.com/gconnect-test/products/1004',
        'SYNCED', GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 4 생성: 기계식 키보드';
END

-- 상품 5: 블루투스 스피커
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%스피커%')
BEGIN
    INSERT INTO Products (
        id, userId, name, description, price, salePrice, stockQuantity,
        imageUrl, thumbnailUrl, category1, category2, category3, categoryPath,
        isActive, isGoogleExposed, googleUrl, syncStatus, createdAt, updatedAt
    )
    VALUES (
        NEWID(), @userId,
        N'GConnect 포터블 블루투스 스피커 20W',
        N'강력한 저음과 선명한 고음! 20W 출력, 15시간 연속 재생, TWS 페어링 지원. 캠핑이나 파티에 최적',
        79000, 59900, 120,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker',
        N'전자기기', N'오디오', N'스피커',
        N'전자기기 > 오디오 > 스피커',
        1, 1,
        'https://smartstore.naver.com/gconnect-test/products/1005',
        'SYNCED', GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 5 생성: 블루투스 스피커';
END

-- 상품 6: 프리미엄 커피 원두
IF NOT EXISTS (SELECT 1 FROM Products WHERE userId = @userId AND name LIKE N'%커피%')
BEGIN
    INSERT INTO Products (
        id, userId, name, description, price, salePrice, stockQuantity,
        imageUrl, thumbnailUrl, category1, category2, category3, categoryPath,
        isActive, isGoogleExposed, googleUrl, syncStatus, createdAt, updatedAt
    )
    VALUES (
        NEWID(), @userId,
        N'GConnect 프리미엄 아라비카 원두 1kg',
        N'에티오피아산 단일 원산지 원두. 풍부한 과일향과 부드러운 신맛이 특징. 로스팅 후 48시간 이내 배송',
        45000, 35900, 200,
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans',
        'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans',
        N'식품', N'음료', N'커피',
        N'식품 > 음료 > 커피',
        1, 1,
        'https://smartstore.naver.com/gconnect-test/products/1006',
        'SYNCED', GETDATE(), GETDATE()
    );
    PRINT N'✅ 상품 6 생성: 프리미엄 커피 원두';
END

-- 결과 확인
SELECT 
    u.shopName,
    COUNT(p.id) AS ProductCount,
    MIN(p.price) AS MinPrice,
    MAX(p.price) AS MaxPrice
FROM Users u
LEFT JOIN Products p ON u.id = p.userId
WHERE u.email = 'test.seller@gconnect.co.kr'
GROUP BY u.shopName;

PRINT N'';
PRINT N'========================================';
PRINT N'✅ 테스트 데이터 생성 완료!';
PRINT N'========================================';
PRINT N'SELLER: test.seller@gconnect.co.kr';
PRINT N'샵명: GConnect 공식 테스트샵';
PRINT N'상품 개수: 6개';
PRINT N'========================================';

