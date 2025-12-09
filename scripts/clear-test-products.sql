-- affiliate_products 테이블의 테스트 데이터 삭제

-- 특정 사용자(키친메이커)의 상품만 삭제
DELETE FROM affiliate_products 
WHERE userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

-- 또는 모든 테스트 상품 삭제 (신중하게!)
-- DELETE FROM affiliate_products;

-- 삭제 후 확인
SELECT 
  COUNT(*) as total_count,
  userId,
  COUNT(*) as user_product_count
FROM affiliate_products
GROUP BY userId;

