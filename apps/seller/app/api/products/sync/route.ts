import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { getDecryptedNaverApiKey } from '@/lib/naver-utils';
import { NaverApiClient, transformNaverProduct } from '@/lib/naver-api';
import { createSyncErrorNotification } from '@/lib/notifications';

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5분

// 에러 타입 분류
enum SyncErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATA_ERROR = 'DATA_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

function classifyError(error: any): SyncErrorType {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('인증') || errorMessage.includes('auth') || errorMessage.includes('token')) {
    return SyncErrorType.AUTH_ERROR;
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
    return SyncErrorType.NETWORK_ERROR;
  }
  if (errorMessage.includes('data') || errorMessage.includes('parse')) {
    return SyncErrorType.DATA_ERROR;
  }
  return SyncErrorType.UNKNOWN_ERROR;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 로직이 포함된 네이버 API 상품 가져오기
 */
async function fetchNaverProductsWithRetry(
  naverClient: NaverApiClient,
  maxPages: number = 3
): Promise<any[]> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Sync] 네이버 API 호출 시도 ${attempt}/${MAX_RETRIES}`);
      const naverProducts = await naverClient.getAllProducts(maxPages);
      console.log(`[Sync] 성공: ${naverProducts.length}개 상품 가져옴`);
      return naverProducts.map(transformNaverProduct);
    } catch (error: any) {
      lastError = error;
      const errorType = classifyError(error);
      console.error(`[Sync] 시도 ${attempt} 실패 (${errorType}):`, error.message);
      
      // 인증 에러는 재시도해도 소용없으므로 즉시 실패
      if (errorType === SyncErrorType.AUTH_ERROR) {
        throw new Error(`네이버 API 인증 실패: ${error.message}`);
      }
      
      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(1.5, attempt - 1); // Exponential backoff
        console.log(`[Sync] ${Math.round(delay / 1000)}초 후 재시도...`);
        await sleep(delay);
      }
    }
  }
  
  // 모든 재시도 실패
  throw new Error(`네이버 API 동기화 실패 (${MAX_RETRIES}회 시도): ${lastError?.message || '알 수 없는 오류'}`);
}

// 상품 동기화 (네이버 API 필수)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 네이버 API 키 확인
    const naverApiKey = await getDecryptedNaverApiKey(session.user.id);
    
    if (!naverApiKey) {
      return NextResponse.json(
        { 
          error: '네이버 API 키가 등록되지 않았습니다.',
          message: '설정에서 네이버 커머스 API 키를 먼저 등록해주세요.'
        },
        { status: 400 }
      );
    }

    let productsToSync: any[] = [];
    let totalCount = 0;
    let retryCount = 0;

    // 네이버 API로 상품 가져오기 (재시도 로직 포함)
    try {
      const naverClient = new NaverApiClient({
        clientId: naverApiKey.clientId,
        clientSecret: naverApiKey.clientSecret,
      });

      const rawNaverProducts = await naverClient.getAllProducts(3);
      console.log(`[Sync] 네이버 API 원본 상품 데이터 (첫 번째 상품):`, JSON.stringify(rawNaverProducts[0], null, 2));
      
      productsToSync = rawNaverProducts.map(transformNaverProduct);
      totalCount = productsToSync.length;
      
      console.log(`[Sync] 변환된 상품 데이터 (첫 번째 상품):`, JSON.stringify(productsToSync[0], null, 2));
    } catch (error: any) {
      console.error('Naver API sync failed after retries:', error);
      
      const errorType = classifyError(error);
      
      // 동기화 실패 로그 생성
      const failedLog = await prisma.syncLog.create({
        data: {
          userId: session.user.id,
          syncType: 'PRODUCT_SYNC',
          status: 'FAILED',
          itemsTotal: 0,
          itemsSynced: 0,
          itemsFailed: 0,
          errorLog: `${errorType}: ${error.message}`,
        },
      });
      
      // 관리자 알림 생성
      await createSyncErrorNotification({
        userId: session.user.id,
        userName: session.user.name || undefined,
        userEmail: session.user.email || undefined,
        errorMessage: error.message,
        errorType,
        syncLogId: failedLog.id,
        retryCount: MAX_RETRIES,
      });
      
      return NextResponse.json(
        { 
          error: '상품 동기화에 실패했습니다.',
          message: error.message,
          syncLogId: failedLog.id
        },
        { status: 500 }
      );
    }

    // 동기화 로그 생성
    const syncLog = await prisma.syncLog.create({
      data: {
        userId: session.user.id,
        syncType: 'PRODUCT_SYNC',
        status: 'SUCCESS',
        itemsTotal: totalCount,
        itemsSynced: 0,
        itemsFailed: 0,
      },
    });

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // 상품 동기화 - 실제 DB 스키마(affiliate_products)에 맞춰 저장
    for (const productData of productsToSync) {
      try {
        // 기존 상품 확인 (product_name으로 중복 체크)
        const existingProduct = productData.name
          ? await prisma.product.findFirst({
              where: {
                userId: session.user.id,
                product_name: productData.name,
              },
            })
          : null;

        if (existingProduct) {
          // 기존 상품 업데이트
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              product_name: productData.name || null,
              sale_price: productData.price ? BigInt(productData.price) : null,
              discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
              representative_product_image_url: productData.imageUrl || null,
              product_url: productData.productUrl || null,
              enabled: true,
              updated_at: new Date(),
            },
          });
          synced++;
        } else {
          // 새 상품 생성
          await prisma.product.create({
            data: {
              userId: session.user.id,
              product_name: productData.name || '상품명 없음',
              sale_price: productData.price ? BigInt(productData.price) : null,
              discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
              representative_product_image_url: productData.imageUrl || null,
              product_url: productData.productUrl || null,
              product_status: 'ON_SALE',
              enabled: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          synced++;
        }
      } catch (error: any) {
        console.error('[Sync] 상품 저장 실패:', error.message);
        console.error('[Sync] 상품 데이터:', JSON.stringify(productData, null, 2));
        errors.push(error.message);
        failed++;
      }
    }

    // 동기화 로그 업데이트
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        itemsSynced: synced,
        itemsFailed: failed,
        status: failed === 0 ? 'SUCCESS' : failed === totalCount ? 'FAILED' : 'PARTIAL',
        errorLog: errors.length > 0 ? errors.join('\n') : null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: '상품 동기화가 완료되었습니다.',
      synced,
      failed,
      total: totalCount,
      syncLogId: syncLog.id,
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json(
      { error: '상품 동기화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

