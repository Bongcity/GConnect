# GConnect 전체 앱 재시작 스크립트
# 사용법: PowerShell에서 .\scripts\restart-all-apps.ps1 실행

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GConnect 전체 앱 재시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 최신 코드 가져오기
Write-Host "[1/6] Git Pull..." -ForegroundColor Yellow
cd D:\gconnect
git pull origin main
Write-Host "✓ Git Pull 완료" -ForegroundColor Green
Write-Host ""

# 2. 모든 Node 프로세스 종료
Write-Host "[2/6] Node 프로세스 종료..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Write-Host "✓ Node 프로세스 종료 완료" -ForegroundColor Green
Write-Host ""

# 3. .next 캐시 폴더 삭제
Write-Host "[3/6] 캐시 폴더 삭제..." -ForegroundColor Yellow
Remove-Item -Recurse -Force apps\ir\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\product\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\seller\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\admin\.next -ErrorAction SilentlyContinue
Write-Host "✓ 캐시 삭제 완료" -ForegroundColor Green
Write-Host ""

# 4. 의존성 재설치
Write-Host "[4/6] 의존성 설치..." -ForegroundColor Yellow
pnpm install
Write-Host "✓ 의존성 설치 완료" -ForegroundColor Green
Write-Host ""

# 5. Prisma 생성
Write-Host "[5/6] Prisma 클라이언트 생성..." -ForegroundColor Yellow
cd packages\db
pnpm prisma generate --schema=prisma/schema.prisma
pnpm prisma generate --schema=prisma/schema-ddro.prisma
cd ..\..
Write-Host "✓ Prisma 생성 완료" -ForegroundColor Green
Write-Host ""

# 6. 앱 시작
Write-Host "[6/6] 앱 시작..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  - IR 앱 시작 중..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\ir; Write-Host 'IR 앱 실행 중...' -ForegroundColor Green; pnpm dev"
Start-Sleep -Seconds 2

Write-Host "  - Product 앱 시작 중..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\product; Write-Host 'Product 앱 실행 중...' -ForegroundColor Green; pnpm dev"
Start-Sleep -Seconds 2

Write-Host "  - Seller 앱 시작 중..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\seller; Write-Host 'Seller 앱 실행 중...' -ForegroundColor Green; pnpm dev"
Start-Sleep -Seconds 2

Write-Host "  - Admin 앱 시작 중..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\admin; Write-Host 'Admin 앱 실행 중...' -ForegroundColor Green; pnpm dev"
Start-Sleep -Seconds 2

Write-Host "  - Scheduler 시작 중..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect; Write-Host 'Scheduler 실행 중...' -ForegroundColor Green; pnpm scheduler"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ 모든 앱이 시작되었습니다!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "각 앱은 별도의 PowerShell 창에서 실행됩니다." -ForegroundColor Yellow
Write-Host "브라우저 캐시도 클리어하세요 (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

