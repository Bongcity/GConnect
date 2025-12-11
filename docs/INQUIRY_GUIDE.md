# 문의하기 기능 가이드

## 개요

셀러 대시보드에 문의하기 기능을 추가하여 사용자가 관리자에게 문의를 보낼 수 있습니다.

---

## 기능 구성

### 1. 빠른 시작 가이드 (동적)

#### 1단계: 네이버 스마트스토어 연결
- **미연결**: "연결하기" 버튼 표시
- **연결됨**: ✅ 연결 완료 + "연결 다시 하기" 버튼

#### 2단계: 상품 동기화 확인
- **활성화 조건**: 네이버 API 연결 완료
- **완료 조건**: 상품 1개 이상 동기화
- **상태**:
  - 미완료: "네이버 API 연결 후 자동 수집..."
  - 완료: "✅ N개 상품이 동기화되었습니다!"

#### 3단계: 구글 검색 노출 시작
- **활성화 조건**: 상품 1개 이상 동기화
- **상태**:
  - 미완료: "상품 동기화 후 24시간 내 노출..."
  - 진행 중: "🚀 상품이 구글 검색에 자동 노출..."

---

## 문의하기 기능

### 엔드포인트

#### POST `/api/inquiry`
문의 생성

**Request Body**:
```json
{
  "title": "문의 제목",
  "content": "문의 내용",
  "category": "GENERAL"  // GENERAL, TECHNICAL, BILLING, FEATURE, BUG
}
```

**Response**:
```json
{
  "ok": true,
  "inquiryId": "uuid",
  "message": "문의가 성공적으로 접수되었습니다."
}
```

#### GET `/api/inquiry`
사용자 본인의 문의 목록 조회

**Response**:
```json
{
  "inquiries": [
    {
      "id": "uuid",
      "title": "문의 제목",
      "category": "GENERAL",
      "status": "PENDING",  // PENDING, IN_PROGRESS, RESOLVED, CLOSED
      "createdAt": "2025-01-11T10:00:00Z",
      "updatedAt": "2025-01-11T10:00:00Z",
      "adminReply": null,  // 답변이 있으면 내용 포함
      "adminName": null,   // 답변한 관리자 이름
      "repliedAt": null    // 답변 시간
    }
  ]
}
```

---

## 데이터베이스 스키마

### Inquiry 모델

```prisma
model Inquiry {
  id            String    @id @default(uuid())
  userId        String
  
  // 문의 내용
  title         String    @db.NVarChar(200)
  content       String    @db.NVarChar(Max)
  category      String    @db.NVarChar(50)
  
  // 상태
  status        String    @db.NVarChar(50)
  
  // 사용자 정보 (조회 최적화용)
  userEmail     String    @db.NVarChar(255)
  userName      String    @db.NVarChar(100)
  userShopName  String?   @db.NVarChar(200)
  
  // 관리자 답변
  adminReply    String?   @db.NVarChar(Max)
  adminName     String?   @db.NVarChar(100)
  repliedAt     DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 배포 절차

### 1. 데이터베이스 마이그레이션

```bash
cd packages/db
pnpm prisma generate
```

**SQL 마이그레이션 (수동 실행)**:
```sql
-- Inquiries 테이블 생성
CREATE TABLE [dbo].[Inquiries] (
    [id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [userId] NVARCHAR(450) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [category] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [userEmail] NVARCHAR(255) NOT NULL,
    [userName] NVARCHAR(100) NOT NULL,
    [userShopName] NVARCHAR(200),
    [adminReply] NVARCHAR(MAX),
    [adminName] NVARCHAR(100),
    [repliedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX [IX_Inquiries_userId] ON [dbo].[Inquiries]([userId]);
CREATE INDEX [IX_Inquiries_status] ON [dbo].[Inquiries]([status]);
CREATE INDEX [IX_Inquiries_category] ON [dbo].[Inquiries]([category]);
CREATE INDEX [IX_Inquiries_createdAt] ON [dbo].[Inquiries]([createdAt]);
```

### 2. 서버 재시작

```powershell
cd D:\GConnect\apps\seller
# Ctrl+C로 기존 종료
pnpm dev
```

---

## 관리자 기능 (TODO)

### Admin 앱에서 구현 필요

1. **문의 목록 조회**
   - 모든 문의 조회
   - 필터: 상태, 카테고리, 날짜
   - 검색: 제목, 내용, 사용자명

2. **문의 상세 보기**
   - 문의 내용 전체 보기
   - 사용자 정보 (이메일, 상점명)
   - 답변 작성 폼

3. **답변 작성**
   ```typescript
   PUT /api/admin/inquiries/:id
   {
     "adminReply": "답변 내용",
     "status": "RESOLVED"
   }
   ```

4. **상태 변경**
   - PENDING → IN_PROGRESS (처리 시작)
   - IN_PROGRESS → RESOLVED (답변 완료)
   - RESOLVED → CLOSED (종료)

---

## UI 컴포넌트

### InquiryModal

**위치**: `apps/seller/components/inquiry/InquiryModal.tsx`

**Props**:
```typescript
interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**사용 예시**:
```tsx
import InquiryModal from '@/components/inquiry/InquiryModal';

const [showInquiryModal, setShowInquiryModal] = useState(false);

<button onClick={() => setShowInquiryModal(true)}>
  문의하기
</button>

<InquiryModal 
  isOpen={showInquiryModal} 
  onClose={() => setShowInquiryModal(false)} 
/>
```

---

## 문의 유형

| 코드 | 이름 | 설명 |
|------|------|------|
| `GENERAL` | 일반 문의 | 일반적인 질문 |
| `TECHNICAL` | 기술 지원 | 기술적 문제, 버그 |
| `BILLING` | 결제/구독 | 결제, 플랜 관련 |
| `FEATURE` | 기능 요청 | 새로운 기능 제안 |
| `BUG` | 버그 신고 | 버그 리포트 |

---

## 문의 상태

| 코드 | 이름 | 설명 |
|------|------|------|
| `PENDING` | 대기 중 | 관리자 확인 대기 |
| `IN_PROGRESS` | 처리 중 | 관리자가 확인하여 처리 중 |
| `RESOLVED` | 해결됨 | 답변 완료 |
| `CLOSED` | 종료됨 | 문의 종료 |

---

## 알림

### 관리자 알림
문의가 접수되면 AdminNotification 생성:
```typescript
await prisma.adminNotification.create({
  data: {
    type: 'INQUIRY',
    title: '새 문의가 접수되었습니다',
    message: `${userName}님의 문의: ${title}`,
    severity: 'INFO',
    link: `/admin/inquiries/${inquiryId}`,
  }
});
```

### 사용자 알림 (TODO)
답변이 등록되면 사용자에게 이메일 발송

---

## 테스트

### 1. 문의 생성 테스트
```bash
curl -X POST http://localhost:3003/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 문의",
    "content": "문의 내용입니다.",
    "category": "GENERAL"
  }'
```

### 2. 문의 목록 조회
```bash
curl http://localhost:3003/api/inquiry
```

---

**작성일**: 2025-01-11
**최종 수정**: 2025-01-11

