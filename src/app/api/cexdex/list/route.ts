import { NextRequest, NextResponse } from 'next/server';
import { getCexDexArbitrages } from '@/lib/services/cexdex-arbitrage';

/**
 * 获取 CEX-DEX 套利行为列表
 * 
 * GET /api/cexdex/list?startDate=xxx&endDate=xxx&searcher=xxx&limit=xxx&offset=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const searcherAddress = searchParams.get('searcher');
    const limitStr = searchParams.get('limit');
    const offsetStr = searchParams.get('offset');

    const options: any = {};

    if (startDateStr) {
      options.startDate = new Date(startDateStr);
    }
    if (endDateStr) {
      options.endDate = new Date(endDateStr);
    }
    if (searcherAddress) {
      options.searcherAddress = searcherAddress;
    }
    if (limitStr) {
      options.limit = parseInt(limitStr, 10);
    }
    if (offsetStr) {
      options.offset = parseInt(offsetStr, 10);
    }

    const results = await getCexDexArbitrages(options);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('获取 CEX-DEX 套利列表失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取 CEX-DEX 套利列表失败',
      },
      { status: 500 }
    );
  }
}

