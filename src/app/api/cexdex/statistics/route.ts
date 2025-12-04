import { NextRequest, NextResponse } from 'next/server';
import { getCexDexArbitrageStatistics } from '@/lib/services/cexdex-arbitrage';

/**
 * 获取 CEX-DEX 套利统计信息
 * 
 * GET /api/cexdex/statistics?startDate=xxx&endDate=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const options: any = {};

    if (startDateStr) {
      options.startDate = new Date(startDateStr);
    }
    if (endDateStr) {
      options.endDate = new Date(endDateStr);
    }

    const stats = await getCexDexArbitrageStatistics(options);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取 CEX-DEX 套利统计信息失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取统计信息失败',
      },
      { status: 500 }
    );
  }
}

