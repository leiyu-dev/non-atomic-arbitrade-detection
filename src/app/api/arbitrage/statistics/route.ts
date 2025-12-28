import { NextRequest, NextResponse } from 'next/server';
import { getArbitrageStatistics } from '@/lib/services/arbitrage';
import { prisma } from '@/lib/prisma';

/**
 * 获取套利统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '请提供开始和结束日期' },
        { status: 400 }
      );
    }

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    const statistics = await getArbitrageStatistics(startTime, endTime);

    // 获取套利机会列表
    const opportunities = await prisma.arbitrageOpportunity.findMany({
      where: {
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json({
      statistics,
      opportunities,
    });
  } catch (error) {
    console.error('获取套利统计信息失败:', error);
    return NextResponse.json(
      { error: '获取套利统计信息失败' },
      { status: 500 }
    );
  }
}

