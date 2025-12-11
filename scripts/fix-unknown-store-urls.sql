-- UNKNOWN_STORE를 실제 스토어 ID(kcmaker)로 교체하는 스크립트
-- 
-- 사용법:
-- 1. 먼저 영향받는 레코드 수 확인 (DRY RUN)
-- 2. 문제없으면 UPDATE 실행

-- ==============================================
-- 1단계: 영향받는 레코드 확인 (실행 전 확인용)
-- ==============================================
SELECT 
    id,
    product_name,
    product_url,
    product_description_url,
    -- 변경될 URL 미리보기
    REPLACE(product_url, 'UNKNOWN_STORE', 'kcmaker') AS new_product_url,
    REPLACE(product_description_url, 'UNKNOWN_STORE', 'kcmaker') AS new_description_url
FROM 
    affiliate_products
WHERE 
    product_url LIKE '%UNKNOWN_STORE%'
    OR product_description_url LIKE '%UNKNOWN_STORE%';

-- ==============================================
-- 2단계: 실제 업데이트 (확인 후 실행)
-- ==============================================
-- ⚠️ 주의: 이 쿼리는 실제 데이터를 변경합니다!
-- 위의 SELECT 결과를 확인한 후에 실행하세요.

-- product_url 업데이트
UPDATE affiliate_products
SET product_url = REPLACE(product_url, 'UNKNOWN_STORE', 'kcmaker')
WHERE product_url LIKE '%UNKNOWN_STORE%';

-- product_description_url 업데이트
UPDATE affiliate_products
SET product_description_url = REPLACE(product_description_url, 'UNKNOWN_STORE', 'kcmaker')
WHERE product_description_url LIKE '%UNKNOWN_STORE%';

-- ==============================================
-- 3단계: 업데이트 결과 확인
-- ==============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN product_url LIKE '%UNKNOWN_STORE%' THEN 1 END) AS unknown_store_count,
    COUNT(CASE WHEN product_url LIKE '%kcmaker%' THEN 1 END) AS kcmaker_count
FROM 
    affiliate_products;

-- ==============================================
-- 참고: 다른 스토어 ID가 필요한 경우
-- ==============================================
-- 만약 'kcmaker'가 아닌 다른 스토어 ID가 필요하다면
-- 위의 쿼리에서 'kcmaker'를 해당 스토어 ID로 변경하세요.
-- 
-- 예시:
-- REPLACE(product_url, 'UNKNOWN_STORE', '실제스토어ID')

