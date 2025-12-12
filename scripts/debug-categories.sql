-- =====================================================
-- 카테고리 디버깅 스크립트
-- =====================================================
USE [GConnect];
GO

PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'1. Seller 상품의 source_cid 확인';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
  source_cid,
  COUNT(*) AS product_count
FROM [dbo].[affiliate_products]
WHERE enabled = 1
  AND source_cid IS NOT NULL
GROUP BY source_cid
ORDER BY product_count DESC;

PRINT N'';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'2. DDRo DB에서 해당 cid의 카테고리 정보';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';

-- DDRo DB에서 조회 (연결 문자열 확인 필요)
-- 여기서는 GConnect DB만 확인
PRINT N'⚠️ DDRo DB 직접 확인 필요:';
PRINT N'';
PRINT N'USE [DDRo];';
PRINT N'SELECT cid, category_1, category_2, category_3';
PRINT N'FROM NaverCategories';
PRINT N'WHERE cid IN (';
PRINT N'  SELECT DISTINCT source_cid';
PRINT N'  FROM [GConnect].[dbo].[affiliate_products]';
PRINT N'  WHERE enabled = 1 AND source_cid IS NOT NULL';
PRINT N');';
PRINT N'';

PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'3. 전체 활성 상품 수';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
  COUNT(*) AS total_active_products,
  COUNT(DISTINCT source_cid) AS unique_categories
FROM [dbo].[affiliate_products]
WHERE enabled = 1;

GO

