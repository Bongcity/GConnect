import { prisma } from '../packages/db';

async function createTestProducts() {
  try {
    console.log('테스트 상품 생성 시작...');

    // 테스트 셀러 찾기
    const seller = await prisma.user.findUnique({
      where: { email: 'test@seller.com' },
    });

    if (!seller) {
      console.error('❌ 테스트 셀러를 찾을 수 없습니다. 먼저 create-test-seller.ts를 실행하세요.');
      return;
    }

    console.log(`✅ 셀러 찾음: ${seller.shopName} (${seller.email})`);

    // 테스트 상품 데이터
    const testProducts = [
      {
        product_name: '[테스트] 남성 캐주얼 면 티셔츠',
        sale_price: BigInt(29900),
        discounted_sale_price: BigInt(24900),
        representative_product_image_url: 'https://via.placeholder.com/500x500?text=Tshirt',
        product_url: 'https://smartstore.naver.com/testshop/products/1',
        source_cid: '50000156', // 패션의류 > 남성의류 > 티셔츠
        source_keyword: '남성 티셔츠',
        store_name: seller.shopName,
      },
      {
        product_name: '[테스트] 여성 원피스 플라워 패턴',
        sale_price: BigInt(49900),
        discounted_sale_price: BigInt(39900),
        representative_product_image_url: 'https://via.placeholder.com/500x500?text=Dress',
        product_url: 'https://smartstore.naver.com/testshop/products/2',
        source_cid: '50000163', // 패션의류 > 여성의류 > 원피스
        source_keyword: '여성 원피스',
        store_name: seller.shopName,
      },
      {
        product_name: '[테스트] 청바지 스키니핏 네이비',
        sale_price: BigInt(59900),
        discounted_sale_price: BigInt(49900),
        representative_product_image_url: 'https://via.placeholder.com/500x500?text=Jeans',
        product_url: 'https://smartstore.naver.com/testshop/products/3',
        source_cid: '50000159', // 패션의류 > 남성의류 > 바지
        source_keyword: '청바지',
        store_name: seller.shopName,
      },
      {
        product_name: '[테스트] 스니커즈 화이트 런닝화',
        sale_price: BigInt(89900),
        discounted_sale_price: BigInt(79900),
        representative_product_image_url: 'https://via.placeholder.com/500x500?text=Sneakers',
        product_url: 'https://smartstore.naver.com/testshop/products/4',
        source_cid: '50000271', // 패션잡화 > 신발 > 운동화
        source_keyword: '스니커즈',
        store_name: seller.shopName,
      },
      {
        product_name: '[테스트] 백팩 노트북 수납 가능',
        sale_price: BigInt(39900),
        discounted_sale_price: BigInt(34900),
        representative_product_image_url: 'https://via.placeholder.com/500x500?text=Backpack',
        product_url: 'https://smartstore.naver.com/testshop/products/5',
        source_cid: '50000246', // 패션잡화 > 가방 > 백팩
        source_keyword: '백팩',
        store_name: seller.shopName,
      },
    ];

    // 상품 생성
    const createdProducts = [];
    for (const productData of testProducts) {
      const product = await prisma.product.create({
        data: {
          userId: seller.id,
          ...productData,
          enabled: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      createdProducts.push(product);
      console.log(`✅ 상품 생성: ${productData.product_name}`);
    }

    console.log(`\n✅ 총 ${createdProducts.length}개의 테스트 상품이 생성되었습니다!`);
    console.log('\n셀러 정보:');
    console.log(`- 이메일: ${seller.email}`);
    console.log(`- 상점명: ${seller.shopName}`);
    console.log(`- 등록 상품 수: ${createdProducts.length}개`);

  } catch (error) {
    console.error('❌ 테스트 상품 생성 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProducts();


