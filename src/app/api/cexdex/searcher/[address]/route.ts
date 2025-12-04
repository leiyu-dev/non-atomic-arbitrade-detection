import { NextRequest, NextResponse } from 'next/server';
import { getSearcherDetails } from '@/lib/services/cexdex-arbitrage';

/**
 * 获取指定搜索者的详细信息
 * 
 * GET /api/cexdex/searcher/[address]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少搜索者地址参数',
        },
        { status: 400 }
      );
    }

    const details = await getSearcherDetails(address);

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('获取搜索者详情失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取搜索者详情失败',
      },
      { status: 500 }
    );
  }
}

