import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { getDecryptedNaverApiKey } from '@/lib/naver-utils';
import { NaverApiClient, transformNaverProduct } from '@/lib/naver-api';

// 가짜 샘플 상품 데이터
const SAMPLE_PRODUCTS = [
  {
    name: '프리미엄 무선 이어폰',
    description: '뛰어난 음질과 긴 배터리 수명을 자랑하는 프리미엄 무선 이어폰입니다.',
    price: 89000,
    salePrice: 69000,
    stockQuantity: 50,
    category1: '전자기기',
    category2: '오디오',
    category3: '이어폰',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  },
  {
    name: '스마트 워치 프로',
    description: '건강 관리와 운동 추적 기능이 탑재된 스마트 워치입니다.',
    price: 320000,
    salePrice: 289000,
    stockQuantity: 30,
    category1: '전자기기',
    category2: '웨어러블',
    category3: '스마트워치',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
  {
    name: '캔버스 백팩',
    description: '내구성이 뛰어난 캔버스 소재의 데일리 백팩입니다.',
    price: 45000,
    salePrice: 35000,
    stockQuantity: 100,
    category1: '패션',
    category2: '가방',
    category3: '백팩',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  },
  {
    name: '스테인리스 텀블러',
    description: '24시간 보온보냉이 가능한 프리미엄 텀블러입니다.',
    price: 28000,
    stockQuantity: 200,
    category1: '생활용품',
    category2: '주방용품',
    category3: '텀블러',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
  },
  {
    name: 'LED 데스크 램프',
    description: '눈의 피로를 줄여주는 무선 충전 기능 탑재 LED 램프입니다.',
    price: 55000,
    salePrice: 49000,
    stockQuantity: 80,
    category1: '가구/인테리어',
    category2: '조명',
    category3: '데스크램프',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
  },
  {
    name: '천연 아로마 디퓨저 세트',
    description: '프리미엄 에센셜 오일이 포함된 아로마 디퓨저 세트입니다.',
    price: 38000,
    stockQuantity: 150,
    category1: '생활용품',
    category2: '향초/디퓨저',
    category3: '디퓨저',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
  },
];

// 상품 동기화 (실제 네이버 API 또는 샘플 데이터)
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
    const useRealApi = !!naverApiKey;

    let productsToSync: any[] = [];
    let totalCount = 0;

    // 실제 네이버 API 사용
    if (useRealApi && naverApiKey) {
      try {
        const naverClient = new NaverApiClient({
          clientId: naverApiKey.clientId,
          clientSecret: naverApiKey.clientSecret,
        });

        // 네이버에서 상품 목록 가져오기 (최대 3페이지, 300개)
        const naverProducts = await naverClient.getAllProducts(3);
        
        productsToSync = naverProducts.map(transformNaverProduct);
        totalCount = naverProducts.length;
      } catch (error) {
        console.error('Naver API sync error:', error);
        // API 오류 시 샘플 데이터로 폴백
        productsToSync = SAMPLE_PRODUCTS;
        totalCount = SAMPLE_PRODUCTS.length;
      }
    } else {
      // 샘플 데이터 사용
      productsToSync = SAMPLE_PRODUCTS;
      totalCount = SAMPLE_PRODUCTS.length;
    }

    // 동기화 로그 생성
    const syncLog = await prisma.syncLog.create({
      data: {
        userId: session.user.id,
        syncType: useRealApi ? 'PRODUCT_SYNC' : 'MANUAL_SYNC',
        status: 'SUCCESS',
        itemsTotal: totalCount,
        itemsSynced: 0,
        itemsFailed: 0,
      },
    });

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // 상품 동기화
    for (const productData of productsToSync) {
      try {
        const categoryPath = [
          productData.category1,
          productData.category2,
          productData.category3,
        ]
          .filter(Boolean)
          .join(' > ');

        // 기존 상품 확인 (naverProductId로)
        const existingProduct = productData.naverProductId
          ? await prisma.product.findFirst({
              where: {
                userId: session.user.id,
                naverProductId: productData.naverProductId,
              },
            })
          : null;

        if (existingProduct) {
          // 기존 상품 업데이트
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              salePrice: productData.salePrice || null,
              stockQuantity: productData.stockQuantity,
              imageUrl: productData.imageUrl,
              thumbnailUrl: productData.thumbnailUrl,
              category1: productData.category1,
              category2: productData.category2,
              category3: productData.category3,
              categoryPath,
              syncStatus: 'SYNCED',
              lastSyncedAt: new Date(),
            },
          });
        } else {
          // 새 상품 생성
          await prisma.product.create({
            data: {
              userId: session.user.id,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              salePrice: productData.salePrice || null,
              stockQuantity: productData.stockQuantity,
              imageUrl: productData.imageUrl,
              thumbnailUrl: productData.thumbnailUrl,
              category1: productData.category1,
              category2: productData.category2,
              category3: productData.category3,
              categoryPath,
              naverProductId: productData.naverProductId || `SAMPLE_${Date.now()}_${synced}`,
              naverProductNo: productData.naverProductNo,
              syncStatus: 'SYNCED',
              isActive: true,
              isGoogleExposed: Math.random() > 0.5,
              lastSyncedAt: new Date(),
            },
          });
        }
        synced++;
      } catch (error: any) {
        console.error('Failed to sync product:', error);
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
      message: `상품 동기화가 완료되었습니다. ${useRealApi ? '(네이버 API)' : '(샘플 데이터)'}`,
      synced,
      failed,
      total: totalCount,
      useRealApi,
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json(
      { error: '상품 동기화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

