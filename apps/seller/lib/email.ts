/**
 * 이메일 발송 유틸리티
 * 
 * Resend API를 사용하여 이메일을 발송합니다.
 * 환경변수 RESEND_API_KEY가 설정되어 있어야 합니다.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * 이메일 발송
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  
  // API 키가 없으면 콘솔에만 로그
  if (!apiKey) {
    console.log('⚠️ RESEND_API_KEY가 설정되지 않아 이메일을 발송하지 않습니다.');
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 Body: ${html.substring(0, 200)}...`);
    return { success: false, message: 'API key not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'GConnect <noreply@gconnect.co.kr>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    console.log(`✅ 이메일 발송 성공 - To: ${to}, ID: ${data.id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ 이메일 발송 실패:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 동기화 성공 이메일 템플릿
 */
export function generateSyncSuccessEmail(details: {
  shopName?: string;
  itemsTotal: number;
  itemsSynced: number;
  itemsFailed: number;
  duration: number;
}) {
  const { shopName, itemsTotal, itemsSynced, itemsFailed, duration } = details;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동기화 완료</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(34, 240, 137, 0.1) 0%, rgba(0, 217, 255, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
          <!-- 헤더 -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #22F089; font-size: 28px; font-weight: bold;">
                ✅ 동기화 완료
              </h1>
              ${shopName ? `<p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 16px;">${shopName}</p>` : ''}
            </td>
          </tr>
          
          <!-- 본문 -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
                네이버 스마트스토어 상품 동기화가 성공적으로 완료되었습니다.
              </p>
              
              <!-- 통계 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">총 항목</td>
                        <td align="right" style="color: #fff; font-size: 18px; font-weight: bold;">${itemsTotal}개</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">동기화 성공</td>
                        <td align="right" style="color: #22F089; font-size: 18px; font-weight: bold;">${itemsSynced}개</td>
                      </tr>
                      ${itemsFailed > 0 ? `
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">동기화 실패</td>
                        <td align="right" style="color: #FF6B6B; font-size: 18px; font-weight: bold;">${itemsFailed}개</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">소요 시간</td>
                        <td align="right" style="color: #00D9FF; font-size: 18px; font-weight: bold;">${(duration / 1000).toFixed(1)}초</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA 버튼 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003'}/dashboard/products" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22F089 0%, #00D9FF 100%); color: #0a0e1a; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                      상품 확인하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- 푸터 -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                이 이메일은 자동 동기화 알림 설정에 의해 발송되었습니다.<br>
                알림 설정을 변경하려면 <a href="${process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003'}/dashboard/settings" style="color: #22F089; text-decoration: none;">설정 페이지</a>를 방문하세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 동기화 실패 이메일 템플릿
 */
export function generateSyncErrorEmail(details: {
  shopName?: string;
  itemsTotal?: number;
  itemsSynced?: number;
  itemsFailed?: number;
  error?: string;
}) {
  const { shopName, itemsTotal = 0, itemsSynced = 0, itemsFailed = 0, error } = details;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동기화 실패</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%); border-radius: 16px; border: 1px solid rgba(255, 107, 107, 0.3); overflow: hidden;">
          <!-- 헤더 -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #FF6B6B; font-size: 28px; font-weight: bold;">
                ⚠️ 동기화 실패
              </h1>
              ${shopName ? `<p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 16px;">${shopName}</p>` : ''}
            </td>
          </tr>
          
          <!-- 본문 -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
                네이버 스마트스토어 상품 동기화 중 오류가 발생했습니다.
              </p>
              
              ${error ? `
              <!-- 오류 메시지 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 16px; background: rgba(255, 107, 107, 0.1); border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.3);">
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">오류 내용</p>
                    <p style="margin: 0; color: #FF6B6B; font-size: 14px; font-family: 'Courier New', monospace;">${error}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- 통계 -->
              ${itemsTotal > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">총 항목</td>
                        <td align="right" style="color: #fff; font-size: 18px; font-weight: bold;">${itemsTotal}개</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">동기화 성공</td>
                        <td align="right" style="color: #22F089; font-size: 18px; font-weight: bold;">${itemsSynced}개</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">동기화 실패</td>
                        <td align="right" style="color: #FF6B6B; font-size: 18px; font-weight: bold;">${itemsFailed}개</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- 해결 방법 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 16px; background: rgba(0, 217, 255, 0.1); border-radius: 12px; border: 1px solid rgba(0, 217, 255, 0.3);">
                    <p style="margin: 0 0 10px; color: #00D9FF; font-size: 14px; font-weight: bold;">💡 해결 방법</p>
                    <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.7); font-size: 13px; line-height: 1.6;">
                      <li>네이버 API 키가 올바르게 설정되어 있는지 확인하세요</li>
                      <li>네이버 스마트스토어 계정 상태를 확인하세요</li>
                      <li>잠시 후 다시 시도해보세요</li>
                      <li>문제가 계속되면 고객 지원팀에 문의하세요</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA 버튼 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003'}/dashboard/sync-logs" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22F089 0%, #00D9FF 100%); color: #0a0e1a; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                      동기화 로그 확인
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- 푸터 -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                이 이메일은 자동 동기화 알림 설정에 의해 발송되었습니다.<br>
                알림 설정을 변경하려면 <a href="${process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003'}/dashboard/settings" style="color: #22F089; text-decoration: none;">설정 페이지</a>를 방문하세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

