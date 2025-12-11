import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * GET /api/admin/system-settings
 * 시스템 설정 조회
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.systemSettings.findFirst();
    
    // 설정이 없으면 기본값으로 생성
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          showDdroProducts: true,
          maintenanceMode: false,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[SystemSettings GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/system-settings
 * 시스템 설정 업데이트
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { showDdroProducts, maintenanceMode, maintenanceMessage } = body;

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // 설정이 없으면 새로 생성
      settings = await prisma.systemSettings.create({
        data: {
          showDdroProducts: showDdroProducts ?? true,
          maintenanceMode: maintenanceMode ?? false,
          maintenanceMessage,
        },
      });
    } else {
      // 기존 설정 업데이트
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          showDdroProducts: showDdroProducts ?? settings.showDdroProducts,
          maintenanceMode: maintenanceMode ?? settings.maintenanceMode,
          maintenanceMessage,
          updatedAt: new Date(),
        },
      });
    }

    console.log('[SystemSettings] Updated:', {
      showDdroProducts: settings.showDdroProducts,
      maintenanceMode: settings.maintenanceMode,
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[SystemSettings PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings', details: error.message },
      { status: 500 }
    );
  }
}

