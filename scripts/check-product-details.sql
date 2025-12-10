-- =============================================
-- 상품 상세 정보 확인 쿼리
-- =============================================

USE [GCONNECT]
GO

-- 1. affiliate_products_detail 테이블 데이터 확인
SELECT 
    d.id,
    p.product_name AS '상품명',
    d.status_type AS '판매상태',
    d.original_price AS '원가',
    d.discount_rate AS '할인율',
    d.brand_name AS '브랜드명',
    d.whole_category_name AS '카테고리',
    d.delivery_fee AS '배송비',
    d.seller_purchase_point AS '구매포인트',
    d.free_interest AS '무이자할부',
    d.created_at AS '생성일시'
FROM affiliate_products_detail d
INNER JOIN affiliate_products p ON d.product_id = p.id
WHERE p.userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'
ORDER BY d.created_at DESC;

-- 2. 카테고리 자동 생성 확인
SELECT 
    category_1 AS '대분류',
    category_2 AS '중분류',
    category_3 AS '소분류',
    cid AS '카테고리ID',
    created_at AS '생성일시'
FROM NaverCategories
ORDER BY created_at DESC;

-- 3. 상품별 모든 상세 정보 (샘플 5개)
SELECT TOP 5
    p.product_name AS '상품명',
    p.sale_price AS '판매가',
    d.status_type AS '판매상태',
    d.display_status AS '전시상태',
    d.original_price AS '원가',
    d.discount_rate AS '할인율(%)',
    d.mobile_discounted_price AS '모바일할인가',
    d.delivery_attribute_type AS '배송속성',
    d.delivery_fee AS '배송비',
    d.return_fee AS '반품비',
    d.exchange_fee AS '교환비',
    d.seller_purchase_point AS '판매자포인트',
    d.manager_purchase_point AS '관리자포인트',
    d.text_review_point AS '텍스트리뷰포인트',
    d.photo_video_review_point AS '포토리뷰포인트',
    d.free_interest AS '무이자할부(개월)',
    d.gift AS '사은품',
    d.brand_name AS '브랜드',
    d.manufacturer_name AS '제조사',
    d.whole_category_name AS '카테고리경로',
    d.knowledge_shopping_registration AS '지식쇼핑등록'
FROM affiliate_products p
INNER JOIN affiliate_products_detail d ON p.id = d.product_id
WHERE p.userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'
ORDER BY d.created_at DESC;

-- 4. 통계: 판매상태별 상품 수
SELECT 
    d.status_type AS '판매상태',
    COUNT(*) AS '상품수'
FROM affiliate_products_detail d
INNER JOIN affiliate_products p ON d.product_id = p.id
WHERE p.userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'
GROUP BY d.status_type
ORDER BY COUNT(*) DESC;

-- 5. 통계: 브랜드별 상품 수
SELECT 
    d.brand_name AS '브랜드',
    COUNT(*) AS '상품수',
    AVG(CAST(d.discount_rate AS FLOAT)) AS '평균할인율(%)'
FROM affiliate_products_detail d
INNER JOIN affiliate_products p ON d.product_id = p.id
WHERE p.userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'
    AND d.brand_name IS NOT NULL
GROUP BY d.brand_name
ORDER BY COUNT(*) DESC;

-- 6. 통계: 대분류별 상품 수
SELECT 
    c.category_1 AS '대분류',
    COUNT(DISTINCT d.id) AS '상품수'
FROM NaverCategories c
INNER JOIN affiliate_products_detail d ON c.cid = d.category_id
INNER JOIN affiliate_products p ON d.product_id = p.id
WHERE p.userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'
GROUP BY c.category_1
ORDER BY COUNT(DISTINCT d.id) DESC;

