import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

// Î∂ÑÏÑù ?∞Ïù¥??Ï°∞Ìöå
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days));

    // Í∏∞Í∞Ñ ??Î∂ÑÏÑù ?∞Ïù¥??Ï°∞Ìöå
    let analyticsData = await prisma.dailyAnalytics.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // ?∞Ïù¥?∞Í? ?ÜÏúºÎ©??òÌîå ?∞Ïù¥???ùÏÑ±
    if (analyticsData.length === 0) {
      analyticsData = await generateSampleAnalytics(session.user.id, days);
    }

    // ?ÅÌíà ?µÍ≥Ñ
    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        isActive: true,
        isGoogleExposed: true,
      },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const exposedProducts = products.filter((p) => p.isGoogleExposed).length;

    // ?©Í≥Ñ Í≥ÑÏÇ∞
    const totals = analyticsData.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.googleImpressions,
        clicks: acc.clicks + day.googleClicks,
        organicTraffic: acc.organicTraffic + day.organicTraffic,
        directTraffic: acc.directTraffic + day.directTraffic,
        referralTraffic: acc.referralTraffic + day.referralTraffic,
      }),
      {
        impressions: 0,
        clicks: 0,
        organicTraffic: 0,
        directTraffic: 0,
        referralTraffic: 0,
      }
    );

    const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    return NextResponse.json({
      ok: true,
      summary: {
        totalImpressions: totals.impressions,
        totalClicks: totals.clicks,
        avgCtr: Number(avgCtr.toFixed(2)),
        totalProducts,
        activeProducts,
        exposedProducts,
      },
      dailyData: analyticsData.map((d) => ({
        date: format(new Date(d.date), 'yyyy-MM-dd'),
        impressions: d.googleImpressions,
        clicks: d.googleClicks,
        ctr: Number(d.googleCtr.toFixed(2)),
      })),
      trafficSources: {
        organic: totals.organicTraffic,
        direct: totals.directTraffic,
        referral: totals.referralTraffic,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Î∂ÑÏÑù ?∞Ïù¥??Ï°∞Ìöå Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

// ?òÌîå Î∂ÑÏÑù ?∞Ïù¥???ùÏÑ±
async function generateSampleAnalytics(userId: string, days: number) {
  const analyticsData = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(today, i));

    // ?úÎç§ ?∞Ïù¥???ùÏÑ± (Ï£ºÎßê?Ä ??≤å, ?âÏùº?Ä ?íÍ≤å)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseFactor = isWeekend ? 0.6 : 1;

    const impressions = Math.floor((Math.random() * 500 + 300) * baseFactor);
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.02)); // 2-7% CTR
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    const totalTraffic = clicks;
    const organicTraffic = Math.floor(totalTraffic * (Math.random() * 0.3 + 0.5)); // 50-80%
    const directTraffic = Math.floor((totalTraffic - organicTraffic) * (Math.random() * 0.5 + 0.3)); // ?òÎ®∏ÏßÄ??30-80%
    const referralTraffic = totalTraffic - organicTraffic - directTraffic;

    // ?ÅÌíà ??(?êÏßÑ??Ï¶ùÍ?)
    const dayProgress = (days - i) / days;
    const totalProducts = Math.floor(6 * dayProgress) + 1;
    const activeProducts = Math.floor(totalProducts * (Math.random() * 0.2 + 0.8));
    const exposedProducts = Math.floor(activeProducts * (Math.random() * 0.3 + 0.5));

    const analytics = await prisma.dailyAnalytics.create({
      data: {
        userId,
        date,
        googleImpressions: impressions,
        googleClicks: clicks,
        googleCtr: ctr,
        totalProducts,
        activeProducts,
        exposedProducts,
        organicTraffic,
        directTraffic,
        referralTraffic,
      },
    });

    analyticsData.push(analytics);
  }

  return analyticsData;
}


