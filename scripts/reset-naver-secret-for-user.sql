-- 특정 사용자의 네이버 Client Secret 초기화
-- 사용법: 쿼리 실행 후 설정 페이지에서 올바른 값 다시 입력

USE [gconnect_db];
GO

-- 현재 저장된 값 확인
SELECT 
    id,
    email,
    naverClientId,
    LEFT(naverClientSecret, 10) as secret_preview,
    LEN(naverClientSecret) as secret_length,
    naverApiEnabled,
    updatedAt
FROM Users 
WHERE id = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

-- ⚠️ Client Secret을 NULL로 초기화 (주석 해제하여 실행)
-- UPDATE Users 
-- SET 
--     naverClientSecret = NULL,
--     naverApiEnabled = 0,
--     updatedAt = GETDATE()
-- WHERE id = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

-- 초기화 후 확인
-- SELECT 
--     id,
--     email,
--     naverClientSecret,
--     naverApiEnabled,
--     updatedAt
-- FROM Users 
-- WHERE id = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';

