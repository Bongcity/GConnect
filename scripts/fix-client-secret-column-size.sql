-- 네이버 Client Secret 컬럼 크기 확인 및 수정
-- 암호화된 값을 저장하기 위해 충분한 크기가 필요합니다.

-- 1. 현재 컬럼 크기 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS 'Current Size'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users' 
    AND COLUMN_NAME = 'naverClientSecret';

-- 2. 컬럼 크기 증가 (NVARCHAR(100) → NVARCHAR(500))
-- AES-256-CBC 암호화된 값은 원본보다 2-3배 길어질 수 있습니다.
-- 원본 60글자 → 암호화 후 약 120-150글자
-- 안전하게 500글자로 설정

ALTER TABLE [dbo].[Users]
ALTER COLUMN [naverClientSecret] NVARCHAR(500) NULL;

-- 3. 변경 후 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS 'New Size'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users' 
    AND COLUMN_NAME = 'naverClientSecret';

-- 4. 기존 데이터 초기화 (잘린 데이터이므로 무용지물)
UPDATE [dbo].[Users]
SET [naverClientSecret] = NULL
WHERE [id] = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

SELECT 
    [id],
    [email],
    [naverClientId],
    [naverClientSecret],
    LEN([naverClientSecret]) AS 'Secret Length'
FROM [dbo].[Users]
WHERE [id] = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

