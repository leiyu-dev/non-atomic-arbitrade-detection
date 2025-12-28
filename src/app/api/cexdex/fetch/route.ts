import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSaveCexDexArbitrages } from '@/lib/services/cexdex-arbitrage';

/**
 * 从 Dune Analytics 获取 CEX-DEX 套利行为识别数据
 * 
 * POST /api/cexdex/fetch
 * 
 * Body (可选):
 * {
 *   "forceRefresh": boolean  // 是否强制刷新已存在的数据
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { forceRefresh = false } = body;

    console.log('开始获取 CEX-DEX 套利行为数据...');
    const results = await fetchAndSaveCexDexArbitrages(forceRefresh);

    return NextResponse.json({
      success: true,
      message: `成功获取并保存 ${results.length} 条 CEX-DEX 套利记录`,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('获取 CEX-DEX 套利数据失败:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    return NextResponse.json(
      {
        success: false,
        error: '获取 CEX-DEX 套利数据失败',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

