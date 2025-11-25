/**
 * Next.js Instrumentation
 * 
 * ?쒕쾭 ?쒖옉 ???ㅽ뻾?섎뒗 珥덇린??肄붾뱶
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initScheduler } = await import('./lib/scheduler');
    
    // ?ㅼ?以꾨윭 珥덇린??
    await initScheduler();
    
    console.log('??Instrumentation ?꾨즺');
  }
}

