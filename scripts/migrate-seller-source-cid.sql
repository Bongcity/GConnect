-- =============================================
-- 📌 서버 데이터베이스 작업: SELLER 상품 source_cid 업데이트
-- =============================================
-- 목적: 기존 SELLER 상품들의 source_cid를 ProductDetail의 category_id로 업데이트
-- 실행 시점: 코드 배포 후, 프로덕션 DB에서 1회 실행
-- 주의: 이 스크립트는 사용자가 직접 실행해야 합니다!
-- =============================================

USE [GCONNECT]
GO

PRINT '🚀 SELLER 상품 source_cid 업데이트 시작...'
PRINT ''

-- 1단계: 현재 상태 확인
PRINT '📊 1단계: 현재 상태 확인'
PRINT '----------------------------------------'
SELECT 
    COUNT(*) AS '총 SELLER 상품 수',
    COUNT(source_cid) AS 'source_cid 있는 상품',
    COUNT(*) - COUNT(source_cid) AS 'source_cid 없는 상품'
FROM affiliate_products
WHERE userId IS NOT NULL; -- SELLER 상품 (userId가 있으면 SELLER)

SELECT 
    COUNT(*) AS '총 ProductDetail 수',
    COUNT(category_id) AS 'category_id 있는 수'
FROM affiliate_products_detail;

PRINT ''
PRINT '----------------------------------------'
PRINT ''

-- 2단계: source_cid 업데이트 (DRY RUN - 확인용)
PRINT '📝 2단계: 업데이트 대상 확인 (실제 업데이트 전)'
PRINT '----------------------------------------'
SELECT 
    p.id AS '상품ID',
    p.product_name AS '상품명',
    p.source_cid AS '현재_source_cid',
    d.category_id AS '새_source_cid',
    d.whole_category_name AS '카테고리명'
FROM affiliate_products p
INNER JOIN affiliate_products_detail d ON p.id = d.product_id
WHERE p.userId IS NOT NULL  -- SELLER 상품
  AND p.source_cid IS NULL  -- source_cid가 없는 것만
  AND d.category_id IS NOT NULL; -- ProductDetail에 category_id가 있는 것만

PRINT ''
PRINT '위 상품들의 source_cid가 업데이트됩니다.'
PRINT ''
PRINT '----------------------------------------'
PRINT ''

-- 3단계: 실제 업데이트 (주석 해제 후 실행)
PRINT '⚠️ 3단계: 실제 업데이트 (아래 주석 해제 후 실행)'
PRINT '----------------------------------------'
/*
-- 주석을 해제하고 실행하세요!

BEGIN TRANSACTION;

UPDATE p
SET 
    p.source_cid = d.category_id,
    p.updated_at = GETDATE()
FROM affiliate_products p
INNER JOIN affiliate_products_detail d ON p.id = d.product_id
WHERE p.userId IS NOT NULL  -- SELLER 상품
  AND d.category_id IS NOT NULL; -- ProductDetail에 category_id가 있는 것만

PRINT '✅ source_cid 업데이트 완료!'
PRINT ''

-- 업데이트 결과 확인
SELECT 
    COUNT(*) AS '업데이트된 상품 수'
FROM affiliate_products
WHERE userId IS NOT NULL
  AND source_cid IS NOT NULL;

COMMIT TRANSACTION;

PRINT '✅ 트랜잭션 커밋 완료!'
*/

PRINT '----------------------------------------'
PRINT ''

-- 4단계: 업데이트 후 검증
PRINT '🔍 4단계: 업데이트 후 검증 (업데이트 완료 후 실행)'
PRINT '----------------------------------------'
/*
-- 주석을 해제하고 실행하세요! (업데이트 완료 후)

-- 카테고리별 상품 수 확인
SELECT 
    nc.category_1 AS '대분류',
    nc.category_2 AS '중분류',
    nc.category_3 AS '소분류',
    COUNT(p.id) AS '상품수'
FROM affiliate_products p
INNER JOIN NaverCategories nc ON p.source_cid = nc.cid
WHERE p.userId IS NOT NULL  -- SELLER 상품
GROUP BY nc.category_1, nc.category_2, nc.category_3
ORDER BY COUNT(p.id) DESC;

PRINT ''
PRINT '✅ SELLER 상품이 NaverCategories와 정상적으로 연결되었습니다!'
*/

PRINT '----------------------------------------'
PRINT ''
PRINT '🎉 스크립트 실행 완료!'
PRINT ''
PRINT '📌 실행 순서:'
PRINT '1. 1~2단계 실행하여 현재 상태 확인'
PRINT '2. 3단계 주석 해제 후 실행하여 실제 업데이트'
PRINT '3. 4단계 주석 해제 후 실행하여 결과 검증'
PRINT ''

