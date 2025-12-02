---
description: GConnect 서버 운영 및 지원 업무를 위한 실행 플랜
---

# GConnect 운영 지원 플랜

## 1. 시스템 구성 재확인
- [ ] 각 앱(IR 3001, Product 3002, Seller 3003, Admin 3004, Scheduler background)이 구동 중인지 확인  
  - PowerShell: `Get-Process node` 또는 PM2 `pm2 status`
- [ ] 필수 환경 변수 점검 (`DATABASE_URL`, `DDRO_DATABASE_URL`, `SCHEDULER_*`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`)
- [ ] Prisma 스키마 버전과 DB 적용 상태 확인  
  - `pnpm db:push` 이전에 `git diff packages/db/prisma/schema.prisma`
- [ ] 네이버 API 연동 대상 계정의 키 저장 여부 확인 (`Users.naverApiEnabled`)

## 2. 환경 설정 체크리스트
| 항목 | 작업 |
| --- | --- |
| Node & pnpm 버전 | `node -v`, `pnpm -v` (Node ≥18, pnpm ≥8) |
| 의존성 | `pnpm install` 후 워크스페이스 전체 정상 설치 여부 |
| Prisma Client | `pnpm prisma generate --schema=...` 두 개 모두 성공 |
| .env 파일 | 루트 및 앱별 `.env.local` 최신화 (Git에 커밋 금지) |
| 권한 | PowerShell 관리자 모드, IIS/방화벽 설정 확인 |

## 3. 배포 & 재시작 플로우
1. **Git 동기화**  
   ```powershell
   git stash
   git pull
   git stash pop
   ```
2. **의존성 및 Prisma**  
   ```powershell
   pnpm install
   cd packages/db
   pnpm prisma generate --schema=prisma/schema.prisma
   pnpm prisma generate --schema=prisma/schema-ddro.prisma
   cd ../..
   ```
3. **기존 프로세스 종료**  
   ```powershell
   taskkill /F /IM node.exe
   ```
4. **앱 실행 (PowerShell 다중 창 예시)**  
   ```powershell
   Start-Process powershell -ArgumentList "-NoExit","-Command","cd D:\gconnect\apps\ir; pnpm dev"
   Start-Process powershell -ArgumentList "-NoExit","-Command","cd D:\gconnect\apps\product; pnpm dev"
   Start-Process powershell -ArgumentList "-NoExit","-Command","cd D:\gconnect\apps\seller; pnpm dev"
   Start-Process powershell -ArgumentList "-NoExit","-Command","cd D:\gconnect\apps\admin; pnpm dev"
   Start-Process powershell -ArgumentList "-NoExit","-Command","cd D:\gconnect; pnpm scheduler"
   ```
5. **PM2 운용 시**  
   - `pm2 start ecosystem.config.js`  
   - `pm2 logs gconnect-scheduler`

## 4. 모니터링 & 로그
- **실시간 상태**: PowerShell 콘솔, `pm2 logs`, 또는 Windows 이벤트 뷰어
- **Scheduler 로그**: `pnpm scheduler` 창 또는 `pm2 logs gconnect-scheduler`
- **DB 상태**: `pnpm db:studio`, `SyncLog`, `SyncSchedule` 테이블
- **에러 알림**: Admin 앱의 `AdminNotification` 확인
- **헬스체크**: 각 포트에서 `/api/health` (필요 시 구현) 호출

## 5. 장애 대응 플로우
| 시나리오 | 원인 후보 | 조치 |
| --- | --- | --- |
| `prisma generate` EPERM | 잠긴 `node.exe` | `taskkill /F /IM node.exe`, `.prisma` 삭제 후 재시도 |
| `MODULE_NOT_FOUND .prisma/client` | generate 미수행 | 위 재생성 단계 반복, `.next` 캐시 삭제 |
| Scheduler 미동작 | `SCHEDULER_ENABLED=false` 또는 프로세스 종료 | env 확인, 스케줄러 재시작, `SyncSchedule.nextRun` 확인 |
| 네이버 API 실패 | 인증키 오류, Rate limit, 네트워크 | AdminNotification 참조, `createSyncErrorNotification` 로그 확인, 키 재등록 |
| 상품 미노출 | `SyncLog` 실패, Seller/Global 조합 오류 | `apps/product/lib/products.ts` 로직 확인, DB 데이터 검증 |

## 6. 커뮤니케이션 & 이슈 트래킹
- 변경 사항은 항상 `docs/` 내 가이드 업데이트와 함께 PR/커밋 메시지에 요약
- 서버측 작업(예: 배포, 재시작, 환경 변수 변경)은 Slack/Notion 등 기록
- 반복되는 문제는 별도 Troubleshooting 문서화 (`docs/TROUBLESHOOTING.md` 후보)

## 7. 다음 단계 제안
1. 각 앱별 Health Check API 추가 (자동 모니터링 대비)
2. Scheduler 로그를 Admin UI에서 조회할 수 있는 뷰 구성
3. `.env` 예시 파일 업데이트 및 비밀정보 관리 정책 문서화
4. GitHub Actions 또는 다른 CI를 통한 자동 테스트/빌드 파이프라인 도입 검토

