/**
 * Next.js Instrumentation
 * 
 * 서버 시작 시 실행되는 초기화 코드
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initScheduler } = await import('./lib/scheduler');
    
    // 스케줄러 초기화
    await initScheduler();
    
    console.log('✅ Instrumentation 완료');
  }
}

