# 사이트맵 localhost 오류 긴급 수정 스크립트

Write-Host ""
Write-Host "🔍 현재 Product 앱의 NEXT_PUBLIC_PRODUCT_URL 확인 중..." -ForegroundColor Yellow
Write-Host ""

$envFile = "D:\GConnect\apps\product\.env.local"

if (Test-Path $envFile) {
    Write-Host "📄 .env.local 파일 내용:" -ForegroundColor Cyan
    Get-Content $envFile | Select-String "NEXT_PUBLIC_PRODUCT_URL"
    Write-Host ""
} else {
    Write-Host "❌ .env.local 파일이 없습니다!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "⚠️  다음 단계를 수행하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣ 서버에서 파일 열기:" -ForegroundColor White
Write-Host "   notepad D:\GConnect\apps\product\.env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ 다음 줄을 찾아서 수정:" -ForegroundColor White
Write-Host "   변경 전: NEXT_PUBLIC_PRODUCT_URL=`"http://localhost:3002`"" -ForegroundColor Red
Write-Host "   변경 후: NEXT_PUBLIC_PRODUCT_URL=`"https://www.gconnect.kr`"" -ForegroundColor Green
Write-Host ""
Write-Host "3️⃣ 저장 후 Product 앱 재시작:" -ForegroundColor White
Write-Host "   cd D:\GConnect\apps\product" -ForegroundColor Gray
Write-Host "   taskkill /F /IM node.exe" -ForegroundColor Gray
Write-Host "   Remove-Item -Recurse -Force .next" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣ 재시작 후 확인:" -ForegroundColor White
Write-Host "   브라우저에서 https://www.gconnect.kr/sitemap.xml 접속" -ForegroundColor Gray
Write-Host "   -> localhost가 아닌 https://www.gconnect.kr로 시작하는지 확인" -ForegroundColor Gray
Write-Host ""

