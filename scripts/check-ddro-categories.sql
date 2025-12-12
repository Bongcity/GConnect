-- =====================================================
-- DDRo DB에서 카테고리 정보 확인
-- =====================================================
USE [DDRo];
GO

PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'Seller 상품의 source_cid별 카테고리 정보';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';

SELECT 
  cid,
  category_1,
  category_2,
  category_3,
  category_4
FROM NaverCategories
WHERE cid IN (
  '50008228',
  '50020199',
  '50019659',
  '50000216',
  '50004769',
  '50008649',
  '50019540'
)
ORDER BY cid;

PRINT N'';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'category_1별 그룹화';
PRINT N'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT N'';

SELECT 
  nc.category_1,
  COUNT(DISTINCT nc.cid) AS cid_count,
  STRING_AGG(nc.cid, ', ') AS cids
FROM NaverCategories nc
WHERE nc.cid IN (
  '50008228',
  '50020199',
  '50019659',
  '50000216',
  '50004769',
  '50008649',
  '50019540'
)
GROUP BY nc.category_1
ORDER BY cid_count DESC;

GO

