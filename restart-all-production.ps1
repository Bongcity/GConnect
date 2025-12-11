# GConnect 전체 앱 재시작 스크립트 (프로덕션)

Write-Host "🔄 모든 Node 프로세스 종료 중..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

Write-Host ""
Write-Host "🗑️  .next 캐시 삭제 중..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "D:\GConnect\apps\product\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "D:\GConnect\apps\seller\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "D:\GConnect\apps\admin\.next" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ 캐시 삭제 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 이제 각 앱을 새 터미널에서 시작하세요:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   터미널 1 - Product:" -ForegroundColor White
Write-Host "   cd D:\GConnect\apps\product; pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   터미널 2 - Seller:" -ForegroundColor White
Write-Host "   cd D:\GConnect\apps\seller; pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   터미널 3 - Admin:" -ForegroundColor White
Write-Host "   cd D:\GConnect\apps\admin; pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "또는 자동으로 시작하려면:" -ForegroundColor Yellow
Write-Host "   .\start-all-apps.ps1" -ForegroundColor Gray

