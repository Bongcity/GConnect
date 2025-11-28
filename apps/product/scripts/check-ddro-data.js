const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'sqlserver://59.23.231.197:14103;database=DDRo;user=sa;password=aA!12345;encrypt=true;trustServerCertificate=true'
    }
  }
});

async function checkData() {
  try {
    console.log('🔍 DDRo DB 데이터 확인 중...\n');
    
    // 전체 상품 수
    const totalResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM affiliate_products`;
    console.log('📊 전체 상품 수:', totalResult[0].total);
    
    // enabled=1 상품 수
    const enabledResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled = 1`;
    console.log('✅ enabled=1 상품 수:', enabledResult[0].total);
    
    // enabled=0 상품 수
    const disabledResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled = 0`;
    console.log('❌ enabled=0 상품 수:', disabledResult[0].total);
    
    // enabled=NULL 상품 수
    const nullResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled IS NULL`;
    console.log('❓ enabled=NULL 상품 수:', nullResult[0].total);
    
    // 최근 상품 5개 샘플 (상품명만)
    console.log('\n📦 최근 상품 샘플 (상품명):');
    const samples = await prisma.$queryRaw`
      SELECT TOP 5 id, product_name, sale_price, enabled, created_at 
      FROM affiliate_products 
      ORDER BY created_at DESC
    `;
    samples.forEach((p, i) => {
      console.log(`${i+1}. [${p.id}] ${p.product_name?.substring(0, 30)}... (${p.sale_price}원, enabled=${p.enabled})`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

