-- 네이버 API 시크릿 초기화 스크립트
-- 잘못된 암호화 값을 초기화합니다

-- 특정 사용자의 시크릿만 초기화 (이메일로 찾기)
-- UPDATE Users 
-- SET naverClientSecret = NULL
-- WHERE email = 'your-email@example.com';

-- 또는 모든 사용자의 시크릿 초기화 (주의: 모든 사용자 영향)
UPDATE Users 
SET naverClientSecret = NULL
WHERE naverClientSecret IS NOT NULL;

SELECT 'naverClientSecret 초기화 완료' AS result;

