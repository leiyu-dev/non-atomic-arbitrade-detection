import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 获取交易数据
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

    const [uniswapTrades, binanceTrades] = await Promise.all([
      prisma.uniswapTrade.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      }),
      prisma.binanceTrade.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      }),
    ]);

    return NextResponse.json({
      uniswapTrades,
      binanceTrades,
    });
  } catch (error) {
    console.error('获取交易数据失败:', error);
    return NextResponse.json(
      { error: '获取交易数据失败' },
      { status: 500 }
    );
  }
}

