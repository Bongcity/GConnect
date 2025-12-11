# GConnect 전체 앱 자동 시작 스크립트 (프로덕션)

Write-Host "🚀 GConnect 프로덕션 서버 시작 중..." -ForegroundColor Cyan
Write-Host ""

# Product 앱 시작
Write-Host "📦 Product 앱 시작 (포트 3002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GConnect\apps\product; Write-Host '📦 Product App' -ForegroundColor Cyan; pnpm dev"
Start-Sleep -Seconds 2

# Seller 앱 시작
Write-Host "🏪 Seller 앱 시작 (포트 3003)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GConnect\apps\seller; Write-Host '🏪 Seller App' -ForegroundColor Yellow; pnpm dev"
Start-Sleep -Seconds 2

# Admin 앱 시작
Write-Host "👨‍💼 Admin 앱 시작 (포트 3004)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GConnect\apps\admin; Write-Host '👨‍💼 Admin App' -ForegroundColor Magenta; pnpm dev"

Write-Host ""
Write-Host "✅ 모든 앱이 새 터미널에서 시작되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 접속 URL:" -ForegroundColor Cyan
Write-Host "   Product: https://www.gconnect.kr" -ForegroundColor White
Write-Host "   Seller:  https://seller.gconnect.kr" -ForegroundColor White
Write-Host "   Admin:   https://admin.gconnect.kr" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  각 앱이 완전히 시작될 때까지 1~2분 기다려주세요." -ForegroundColor Yellow

