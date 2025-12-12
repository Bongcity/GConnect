import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { getDecryptedNaverApiKey } from '@/lib/naver-utils';
import { NaverApiClient, transformNaverProduct } from '@/lib/naver-api';
import { createSyncErrorNotification } from '@/lib/notifications';
import { processNaverCategory } from '@/lib/category-utils';

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
 * 각 상품의 상세 정보도 함께 조회
 */
async function fetchNaverProductsWithRetry(
  naverClient: NaverApiClient,
  maxPages: number = 3,
  storeId?: string
): Promise<any[]> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Sync] 네이버 API 호출 시도 ${attempt}/${MAX_RETRIES}`);
      const naverProducts = await naverClient.getAllProducts(maxPages);
      console.log(`[Sync] 성공: ${naverProducts.length}개 상품 가져옴`);
      
      // 상세 정보 조회 (병렬 처리, 5개씩)
      console.log(`[Sync] 상품 상세 정보 조회 시작...`);
      const BATCH_SIZE = 5;
      const transformedProducts: any[] = [];
      
      for (let i = 0; i < naverProducts.length; i += BATCH_SIZE) {
        const batch = naverProducts.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (product) => {
            const channelProductNo = product.channelProducts?.[0]?.channelProductNo;
            if (!channelProductNo) {
              console.warn(`[Sync] channelProductNo 없음:`, product);
              return transformNaverProduct(product, undefined, storeId);
            }
            
            // 상세 정보 조회
            const detailData = await naverClient.getChannelProductDetail(channelProductNo.toString());
            return transformNaverProduct(product, detailData, storeId);
          })
        );
        transformedProducts.push(...batchResults);
        
        // 진행 상황 출력
        console.log(`[Sync] 상세 정보 조회 진행: ${Math.min(i + BATCH_SIZE, naverProducts.length)}/${naverProducts.length}`);
      }
      
      console.log(`[Sync] 상세 정보 조회 완료: ${transformedProducts.length}개`);
      return transformedProducts;
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

      // 스토어 ID 조회 (URL 생성용)
      const storeId = await naverClient.getStoreId();
      console.log(`[Sync] 스토어 ID 조회 완료: ${storeId}`);

      // fetchNaverProductsWithRetry가 이미 변환된 상품을 반환
      productsToSync = await fetchNaverProductsWithRetry(naverClient, 3, storeId);
      totalCount = productsToSync.length;
      
      console.log(`[Sync] ${totalCount}개 상품 변환 완료`);
      
      console.log(`[Sync] ${productsToSync.length}개 상품 변환 완료`);
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
        // 필수 데이터 검증 - 상품명과 고유ID가 없으면 스킵
        if (!productData.name || productData.name === '상품명 없음' || !productData.naverProductId) {
          console.warn('[Sync] 상품 데이터 불충분, 스킵:', { 
            name: productData.name, 
            id: productData.naverProductId,
            rawData: JSON.stringify(productData).substring(0, 200) 
          });
          failed++;
          errors.push('상품 데이터 불충분 (상품명 또는 ID 누락)');
          continue;
        }

        // 1단계: 카테고리 먼저 처리하여 source_cid 얻기
        let sourceCid: string | null = null;
        if (productData.detail?.wholeCategoryName && productData.detail?.wholeCategoryId) {
          try {
            const categoryResult = await processNaverCategory(
              productData.detail.wholeCategoryName,
              productData.detail.wholeCategoryId
            );
            sourceCid = categoryResult?.cid || null;
            console.log(`[Sync] 카테고리 처리 완료: ${sourceCid}`);
          } catch (categoryError: any) {
            console.error('[Sync] 카테고리 생성 실패:', categoryError.message);
            // 카테고리 생성 실패해도 상품은 저장
          }
        }

        // 2단계: 기존 상품 확인 (naverProductId로 중복 체크)
        const existingProduct = await prisma.product.findFirst({
          where: {
            userId: session.user.id,
            product_name: productData.name,
          },
        });

        let savedProduct;

        if (existingProduct) {
          // 기존 상품 업데이트
          savedProduct = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              product_name: productData.name,
              sale_price: productData.price ? BigInt(productData.price) : null,
              discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
              discounted_rate: productData.discountedRate || null, // 할인율
              representative_product_image_url: productData.imageUrl || null,
              product_url: productData.productUrl || null,
              
              // 스토어 정보
              affiliate_store_id: productData.storeId ? BigInt(productData.storeId) : null,
              store_name: productData.storeName || null,
              brand_store: productData.brandStore ? true : false, // 명시적으로 0 또는 1
              store_status: productData.storeStatus || 'ACTIVE',  // 상품 상태 ('ACTIVE' | 'INACTIVE')
              
              // 수수료 정보
              commission_rate: productData.commissionRate || null,
              promotion_commission_rate: productData.promotionCommissionRate || null,
              
              // 추가 이미지 (JSON 문자열로 저장)
              other_product_image_urls: productData.otherImageUrls && productData.otherImageUrls.length > 0
                ? JSON.stringify(productData.otherImageUrls)
                : null,
              
              // 상세 URL 및 프로모션
              product_description_url: productData.descriptionUrl || null,
              promotion_json: productData.promotionJson || null,
              
              source_cid: sourceCid,
              enabled: productData.storeStatus === 'ACTIVE',  // ACTIVE 상품만 활성화
              updated_at: new Date(),
            },
          });
        } else {
          // 새 상품 생성
          savedProduct = await prisma.product.create({
            data: {
              userId: session.user.id,
              product_name: productData.name,
              sale_price: productData.price ? BigInt(productData.price) : null,
              discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
              discounted_rate: productData.discountedRate || null, // 할인율
              representative_product_image_url: productData.imageUrl || null,
              product_url: productData.productUrl || null,
              product_status: 'ON_SALE',
              
              // 스토어 정보
              affiliate_store_id: productData.storeId ? BigInt(productData.storeId) : null,
              store_name: productData.storeName || null,
              brand_store: productData.brandStore ? true : false, // 명시적으로 0 또는 1
              store_status: productData.storeStatus || 'ACTIVE',  // 상품 상태 ('ACTIVE' | 'INACTIVE')
              
              // 수수료 정보
              commission_rate: productData.commissionRate || null,
              promotion_commission_rate: productData.promotionCommissionRate || null,
              
              // 추가 이미지 (JSON 문자열로 저장)
              other_product_image_urls: productData.otherImageUrls && productData.otherImageUrls.length > 0
                ? JSON.stringify(productData.otherImageUrls)
                : null,
              
              // 상세 URL 및 프로모션
              product_description_url: productData.descriptionUrl || null,
              promotion_json: productData.promotionJson || null,
              
              source_cid: sourceCid,
              enabled: productData.storeStatus === 'ACTIVE',  // ACTIVE 상품만 활성화
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }

        // 상세 정보 저장 (ProductDetail)
        if (productData.detail && savedProduct) {
          try {
            const existingDetail = await prisma.productDetail.findUnique({
              where: { product_id: savedProduct.id },
            });

            if (existingDetail) {
              // 기존 상세 정보 업데이트
              await prisma.productDetail.update({
                where: { product_id: savedProduct.id },
                data: {
                  origin_product_no: productData.detail.originProductNo ? BigInt(productData.detail.originProductNo) : null,
                  channel_product_no: productData.detail.channelProductNo ? BigInt(productData.detail.channelProductNo) : null,
                  status_type: productData.detail.statusType || null,
                  display_status: productData.detail.displayStatus || null,
                  original_price: productData.detail.originalPrice ? BigInt(productData.detail.originalPrice) : null,
                  // discount_rate: 제거됨 - affiliate_products.discounted_rate 사용
                  discount_rate: 0, // deprecated
                  mobile_discounted_price: productData.detail.mobileDiscountedPrice ? BigInt(productData.detail.mobileDiscountedPrice) : null,
                  delivery_attribute_type: productData.detail.deliveryAttributeType || null,
                  delivery_fee: productData.detail.deliveryFee ? BigInt(productData.detail.deliveryFee) : null,
                  return_fee: productData.detail.returnFee ? BigInt(productData.detail.returnFee) : null,
                  exchange_fee: productData.detail.exchangeFee ? BigInt(productData.detail.exchangeFee) : null,
                  seller_purchase_point: productData.detail.sellerPurchasePoint || null,
                  seller_purchase_point_unit: productData.detail.sellerPurchasePointUnit || null,
                  manager_purchase_point: productData.detail.managerPurchasePoint || null,
                  text_review_point: productData.detail.textReviewPoint || null,
                  photo_video_review_point: productData.detail.photoVideoReviewPoint || null,
                  regular_customer_point: productData.detail.regularCustomerPoint || null,
                  free_interest: productData.detail.freeInterest || null,
                  gift: productData.detail.gift || null,
                  category_id: productData.detail.categoryId || null,
                  whole_category_id: productData.detail.wholeCategoryId || null,
                  whole_category_name: productData.detail.wholeCategoryName || null,
                  brand_name: productData.detail.brandName || null,
                  manufacturer_name: productData.detail.manufacturerName || null,
                  knowledge_shopping_registration: productData.detail.knowledgeShoppingRegistration || null,
                  updated_at: new Date(),
                },
              });
            } else {
              // 새 상세 정보 생성
              await prisma.productDetail.create({
                data: {
                  product_id: savedProduct.id,
                  origin_product_no: productData.detail.originProductNo ? BigInt(productData.detail.originProductNo) : null,
                  channel_product_no: productData.detail.channelProductNo ? BigInt(productData.detail.channelProductNo) : null,
                  status_type: productData.detail.statusType || null,
                  display_status: productData.detail.displayStatus || null,
                  original_price: productData.detail.originalPrice ? BigInt(productData.detail.originalPrice) : null,
                  // discount_rate: 제거됨 - affiliate_products.discounted_rate 사용
                  discount_rate: 0, // deprecated
                  mobile_discounted_price: productData.detail.mobileDiscountedPrice ? BigInt(productData.detail.mobileDiscountedPrice) : null,
                  delivery_attribute_type: productData.detail.deliveryAttributeType || null,
                  delivery_fee: productData.detail.deliveryFee ? BigInt(productData.detail.deliveryFee) : null,
                  return_fee: productData.detail.returnFee ? BigInt(productData.detail.returnFee) : null,
                  exchange_fee: productData.detail.exchangeFee ? BigInt(productData.detail.exchangeFee) : null,
                  seller_purchase_point: productData.detail.sellerPurchasePoint || null,
                  seller_purchase_point_unit: productData.detail.sellerPurchasePointUnit || null,
                  manager_purchase_point: productData.detail.managerPurchasePoint || null,
                  text_review_point: productData.detail.textReviewPoint || null,
                  photo_video_review_point: productData.detail.photoVideoReviewPoint || null,
                  regular_customer_point: productData.detail.regularCustomerPoint || null,
                  free_interest: productData.detail.freeInterest || null,
                  gift: productData.detail.gift || null,
                  category_id: productData.detail.categoryId || null,
                  whole_category_id: productData.detail.wholeCategoryId || null,
                  whole_category_name: productData.detail.wholeCategoryName || null,
                  brand_name: productData.detail.brandName || null,
                  manufacturer_name: productData.detail.manufacturerName || null,
                  knowledge_shopping_registration: productData.detail.knowledgeShoppingRegistration || null,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              });
            }
          } catch (detailError: any) {
            console.error('[Sync] ProductDetail 저장 실패:', detailError.message);
            // ProductDetail 저장 실패해도 상품은 저장되었으므로 계속 진행
          }
        }

        synced++;
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

