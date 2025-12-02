#!/bin/bash
# GConnect 자동 동기화 스케줄러 시작 스크립트

cd "$(dirname "$0")/.."

echo "Starting GConnect Sync Scheduler..."
NODE_ENV=production tsx scripts/sync-scheduler.ts

