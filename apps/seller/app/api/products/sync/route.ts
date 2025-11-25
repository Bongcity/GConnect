import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { getDecryptedNaverApiKey, transformNaverProduct } from '@/lib/naver-api';
import NaverApiClient from '@/lib/naver-api';

// 가�??�플 ?�품 ?�이??
const SAMPLE_PRODUCTS = [
  {
    name: '?�리미엄 무선 ?�어??,
    description: '?�어???�질�?�?배터�??�명???�랑?�는 ?�리미엄 무선 ?�어?�입?�다.',
    price: 89000,
    salePrice: 69000,
    stockQuantity: 50,
    category1: '?�자기기',
    category2: '?�디??,
    category3: '?�어??,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  },
  {
    name: '?�마???�치 ?�로',
    description: '건강 관리�? ?�동 추적 기능???�재???�마???�치?�니??',
    price: 320000,
    salePrice: 289000,
    stockQuantity: 30,
    category1: '?�자기기',
    category2: '?�어?�블',
    category3: '?�마?�워�?,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
  {
    name: '캔버??백팩',
    description: '?�구?�이 ?�어??캔버???�재???�일�?백팩?�니??',
    price: 45000,
    salePrice: 35000,
    stockQuantity: 100,
    category1: '?�션',
    category2: '가�?,
    category3: '백팩',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  },
  {
    name: '?�테?�리???�블러',
    description: '24?�간 보온보냉??가?�한 ?�리미엄 ?�블러?�니??',
    price: 28000,
    stockQuantity: 200,
    category1: '?�활?�품',
    category2: '주방?�품',
    category3: '?�블러',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
  },
  {
    name: 'LED ?�스???�프',
    description: '?�의 ?�로�?줄여주는 무선 충전 기능 ?�재 LED ?�프?�니??',
    price: 55000,
    salePrice: 49000,
    stockQuantity: 80,
    category1: '가�??�테리어',
    category2: '조명',
    category3: '?�스?�램??,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
  },
  {
    name: '천연 ?�로�??�퓨?� ?�트',
    description: '?�리미엄 ?�센???�일???�함???�로�??�퓨?� ?�트?�니??',
    price: 38000,
    stockQuantity: 150,
    category1: '?�활?�품',
    category2: '?�초/?�퓨?�',
    category3: '?�퓨?�',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
  },
];

// ?�품 ?�기??(?�제 ?�이�?API ?�는 ?�플 ?�이??
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?�증???�요?�니??' },
        { status: 401 }
      );
    }

    // ?�이�?API ???�인
    const naverApiKey = await getDecryptedNaverApiKey(session.user.id);
    const useRealApi = !!naverApiKey;

    let productsToSync: any[] = [];
    let totalCount = 0;

    // ?�제 ?�이�?API ?�용
    if (useRealApi && naverApiKey) {
      try {
        const naverClient = new NaverApiClient({
          clientId: naverApiKey.clientId,
          clientSecret: naverApiKey.clientSecret,
        });

        // ?�이버에???�품 목록 가?�오�?(최�? 3?�이지, 300�?
        const naverProducts = await naverClient.getAllProducts(3);
        
        productsToSync = naverProducts.map(transformNaverProduct);
        totalCount = naverProducts.length;
      } catch (error) {
        console.error('Naver API sync error:', error);
        // API ?�류 ???�플 ?�이?�로 ?�백
        productsToSync = SAMPLE_PRODUCTS;
        totalCount = SAMPLE_PRODUCTS.length;
      }
    } else {
      // ?�플 ?�이???�용
      productsToSync = SAMPLE_PRODUCTS;
      totalCount = SAMPLE_PRODUCTS.length;
    }

    // ?�기??로그 ?�성
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

    // ?�품 ?�기??
    for (const productData of productsToSync) {
      try {
        const categoryPath = [
          productData.category1,
          productData.category2,
          productData.category3,
        ]
          .filter(Boolean)
          .join(' > ');

        // 기존 ?�품 ?�인 (naverProductId�?
        const existingProduct = productData.naverProductId
          ? await prisma.product.findFirst({
              where: {
                userId: session.user.id,
                naverProductId: productData.naverProductId,
              },
            })
          : null;

        if (existingProduct) {
          // 기존 ?�품 ?�데?�트
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
          // ???�품 ?�성
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

    // ?�기??로그 ?�데?�트
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
      message: `?�품 ?�기?��? ?�료?�었?�니?? ${useRealApi ? '(?�이�?API)' : '(?�플 ?�이??'}`,
      synced,
      failed,
      total: totalCount,
      useRealApi,
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json(
      { error: '?�품 ?�기??�??�류가 발생?�습?�다.' },
      { status: 500 }
    );
  }
}

