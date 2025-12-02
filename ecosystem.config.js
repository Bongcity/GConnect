/**
 * PM2 Ecosystem Configuration
 * GConnect 프로젝트의 모든 앱과 스케줄러를 관리합니다.
 * 
 * 사용법:
 * - 모든 앱 시작: pm2 start ecosystem.config.js
 * - 특정 앱만 시작: pm2 start ecosystem.config.js --only gconnect-scheduler
 * - 상태 확인: pm2 status
 * - 로그 확인: pm2 logs
 * - 재시작: pm2 restart ecosystem.config.js
 * - 중지: pm2 stop ecosystem.config.js
 * - 삭제: pm2 delete ecosystem.config.js
 */

module.exports = {
  apps: [
    // IR 사이트 (투자자 관계)
    {
      name: 'gconnect-ir',
      script: 'pnpm',
      args: 'dev --filter @gconnect/ir',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },

    // Product 사이트 (상품 카탈로그)
    {
      name: 'gconnect-product',
      script: 'pnpm',
      args: 'dev --filter @gconnect/product',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },

    // Seller 사이트 (판매자 대시보드)
    {
      name: 'gconnect-seller',
      script: 'pnpm',
      args: 'dev --filter @gconnect/seller',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },

    // Admin 사이트 (관리자 대시보드)
    {
      name: 'gconnect-admin',
      script: 'pnpm',
      args: 'dev --filter @gconnect/admin',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
    },

    // 자동 동기화 스케줄러
    {
      name: 'gconnect-scheduler',
      script: 'pnpm',
      args: 'scheduler',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        SCHEDULER_ENABLED: 'true',
        SCHEDULER_CHECK_INTERVAL: '60000',
        SCHEDULER_MAX_CONCURRENT: '1',
      },
      // 스케줄러는 다른 앱들이 시작된 후에 시작
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

