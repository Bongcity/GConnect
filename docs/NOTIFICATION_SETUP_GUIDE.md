# 동기화 알림 시스템 설정 가이드 📧

자동 동기화 결과를 이메일로 받는 방법을 안내합니다.

---

## 📋 목차

1. [개요](#개요)
2. [이메일 서비스 선택](#이메일-서비스-선택)
3. [Nodemailer + Gmail 설정](#nodemailer--gmail-설정)
4. [SendGrid 설정](#sendgrid-설정)
5. [코드 구현](#코드-구현)
6. [테스트](#테스트)

---

## 개요

GConnect는 자동 동기화 작업 완료 시 이메일 알림을 보낼 수 있습니다.

### 알림 시점

- ✅ **성공 시**: 동기화가 성공적으로 완료됨
- ❌ **실패 시**: 동기화 중 오류 발생
- ⚠️ **부분 성공 시**: 일부 상품 동기화 실패

### 알림 내용

- 동기화 상태 (성공/실패)
- 처리된 상품 수
- 성공/실패 상품 수
- 소요 시간
- 오류 메시지 (실패 시)

---

## 이메일 서비스 선택

### 1. Nodemailer + Gmail (무료)

**장점**:
- 무료 (Gmail 계정만 있으면 됨)
- 설정 간단
- 개발/테스트에 적합

**단점**:
- 일일 전송 제한 (Gmail: 500통/일)
- 스팸 처리 가능성
- 전송 속도 느림

**추천**: 소규모, 개발/테스트 환경

### 2. SendGrid (유료, 무료 플랜 있음)

**장점**:
- 무료 플랜: 100통/일
- 높은 전송률
- 전송 분석 제공
- 전문적인 이메일 서비스

**단점**:
- 계정 생성 필요
- API 키 관리 필요

**추천**: 프로덕션 환경

### 3. AWS SES (유료, 가성비 좋음)

**장점**:
- 저렴한 비용 ($0.10/1,000통)
- AWS 통합
- 높은 신뢰성

**단점**:
- AWS 계정 필요
- 초기 설정 복잡

**추천**: 대규모, AWS 인프라 사용 중

---

## Nodemailer + Gmail 설정

### 1단계: 라이브러리 설치

```bash
cd apps/seller
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### 2단계: Gmail 앱 비밀번호 생성

1. Google 계정 관리: https://myaccount.google.com
2. **보안** → **2단계 인증** 활성화 (필수)
3. **보안** → **앱 비밀번호** 클릭
4. 앱 선택: **메일**, 기기 선택: **기타** (GConnect)
5. 생성된 16자리 비밀번호 복사

### 3단계: 환경 변수 설정

`.env.local`:
```env
# 이메일 설정 (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=앱비밀번호16자리
EMAIL_FROM=your-email@gmail.com
```

### 4단계: 이메일 유틸리티 생성

`apps/seller/lib/email.ts`:
```typescript
import nodemailer from 'nodemailer';

// 트랜스포터 생성
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

---

## SendGrid 설정

### 1단계: SendGrid 계정 생성

1. https://sendgrid.com 접속
2. 무료 플랜 가입
3. 발신자 인증 (Single Sender Verification)

### 2단계: API 키 생성

1. Settings → API Keys
2. Create API Key
3. Full Access 권한 부여
4. API 키 복사

### 3단계: 라이브러리 설치

```bash
cd apps/seller
pnpm add @sendgrid/mail
```

### 4단계: 환경 변수 설정

`.env.local`:
```env
# 이메일 설정 (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
EMAIL_FROM=your-verified-email@example.com
```

### 5단계: 이메일 유틸리티 생성

`apps/seller/lib/email.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: process.env.EMAIL_FROM!,
      subject: options.subject,
      html: options.html,
    };

    const [response] = await sgMail.send(msg);
    console.log('Email sent:', response.statusCode);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

---

## 코드 구현

### 1단계: 이메일 템플릿 생성

`apps/seller/lib/email-templates.ts`:
```typescript
export function generateSyncSuccessEmail(details: any) {
  const { shopName, itemsTotal, itemsSynced, duration } = details;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22F089 0%, #00D9FF 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
        .stats { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .stat-item { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; color: #888; margin-top: 30px; font-size: 12px; }
        .success { color: #22F089; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ 자동 동기화 완료</h1>
          <p>${shopName}</p>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p>자동 동기화 작업이 <span class="success">성공적으로 완료</span>되었습니다.</p>
          
          <div class="stats">
            <div class="stat-item">
              <span>총 상품 수</span>
              <strong>${itemsTotal}개</strong>
            </div>
            <div class="stat-item">
              <span>동기화 성공</span>
              <strong>${itemsSynced}개</strong>
            </div>
            <div class="stat-item">
              <span>소요 시간</span>
              <strong>${(duration / 1000).toFixed(2)}초</strong>
            </div>
          </div>
          
          <p>자세한 내용은 <a href="${process.env.NEXT_PUBLIC_SELLER_URL}/dashboard/sync-logs">동기화 로그</a>에서 확인하세요.</p>
        </div>
        <div class="footer">
          <p>이 이메일은 GConnect 자동 동기화 시스템에서 발송되었습니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateSyncErrorEmail(details: any) {
  const { shopName, error } = details;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
        .error { background: #fff2f0; border: 1px solid #ffccc7; padding: 15px; 
                 border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #888; margin-top: 30px; font-size: 12px; }
        .failed { color: #FF4D4F; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ 자동 동기화 실패</h1>
          <p>${shopName}</p>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p>자동 동기화 작업이 <span class="failed">실패</span>했습니다.</p>
          
          <div class="error">
            <strong>오류 내용:</strong>
            <p>${error || '알 수 없는 오류'}</p>
          </div>
          
          <p><strong>확인 사항:</strong></p>
          <ul>
            <li>네이버 API 설정이 올바른지 확인</li>
            <li>API 키가 유효한지 확인</li>
            <li>네트워크 연결 상태 확인</li>
          </ul>
          
          <p>자세한 내용은 <a href="${process.env.NEXT_PUBLIC_SELLER_URL}/dashboard/sync-logs">동기화 로그</a>에서 확인하세요.</p>
        </div>
        <div class="footer">
          <p>이 이메일은 GConnect 자동 동기화 시스템에서 발송되었습니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

### 2단계: 스케줄러에 이메일 전송 추가

`apps/seller/lib/scheduler.ts`에서 `sendNotification` 함수 수정:

```typescript
import { sendEmail } from './email';
import { generateSyncSuccessEmail, generateSyncErrorEmail } from './email-templates';

async function sendNotification(schedule: any, status: string, details: any) {
  try {
    console.log(`📧 알림 전송 - 사용자: ${schedule.userId}, 상태: ${status}`);
    
    if (!schedule.notifyEmail) {
      console.log('알림 이메일이 설정되지 않음');
      return;
    }

    const subject = status === 'SUCCESS' 
      ? '[GConnect] 자동 동기화 완료 ✅'
      : '[GConnect] 자동 동기화 실패 ❌';

    const html = status === 'SUCCESS'
      ? generateSyncSuccessEmail({
          shopName: schedule.user.shopName || '내 상점',
          ...details,
        })
      : generateSyncErrorEmail({
          shopName: schedule.user.shopName || '내 상점',
          ...details,
        });

    await sendEmail({
      to: schedule.notifyEmail,
      subject,
      html,
    });

    console.log(`✅ 알림 전송 완료: ${schedule.notifyEmail}`);
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
}
```

---

## 테스트

### 1단계: 이메일 전송 테스트 API 생성

`apps/seller/app/api/test-email/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    }

    const { to } = await req.json();

    await sendEmail({
      to,
      subject: '[GConnect] 테스트 이메일',
      html: '<h1>이메일 전송 테스트</h1><p>이메일이 성공적으로 전송되었습니다!</p>',
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2단계: 테스트 실행

```bash
curl -X POST http://localhost:3003/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

또는 브라우저 콘솔:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'your-email@example.com' })
});
```

---

## 문제 해결

### Gmail 인증 오류

**오류**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**해결**:
1. 2단계 인증 활성화 확인
2. 앱 비밀번호 재생성
3. "보안 수준이 낮은 앱" 설정 해제 (구버전 Gmail)

### 스팸 처리

**문제**: 이메일이 스팸함으로 이동

**해결**:
1. SPF/DKIM 설정 (도메인 이메일 사용 시)
2. SendGrid 등 전문 서비스 사용
3. 수신자가 발신자를 연락처에 추가

### 전송 실패

**문제**: 이메일 전송 시 오류 발생

**해결**:
1. 환경 변수 확인
2. 네트워크 연결 확인
3. API 키/비밀번호 재확인
4. 일일 전송 한도 확인

---

## 요약

✅ **완료 체크리스트**

- [ ] 이메일 서비스 선택 (Gmail/SendGrid/AWS SES)
- [ ] 라이브러리 설치
- [ ] 환경 변수 설정
- [ ] 이메일 유틸리티 생성
- [ ] 템플릿 작성
- [ ] 스케줄러에 알림 추가
- [ ] 테스트 이메일 전송
- [ ] 실제 동기화 알림 확인

---

**참고 자료**:
- [Nodemailer 문서](https://nodemailer.com)
- [SendGrid Node.js 가이드](https://docs.sendgrid.com/for-developers/sending-email/v3-nodejs-code-example)
- [AWS SES 문서](https://docs.aws.amazon.com/ses/)

