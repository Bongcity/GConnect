@echo off
echo ========================================
echo Seller App 캐시 클리어 스크립트
echo ========================================

cd /d %~dp0\..\apps\seller

echo.
echo [1/4] .next 폴더 삭제 중...
if exist .next rmdir /s /q .next
echo ✓ .next 폴더 삭제 완료

echo.
echo [2/4] node_modules 폴더 삭제 중...
if exist node_modules rmdir /s /q node_modules
echo ✓ node_modules 폴더 삭제 완료

echo.
echo [3/4] 의존성 재설치 중...
call pnpm install
echo ✓ 의존성 재설치 완료

echo.
echo [4/4] 개발 서버 시작...
call pnpm dev

pause

