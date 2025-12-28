import { NextRequest, NextResponse } from 'next/server';
import {
  detectArbitrageOpportunities,
  saveArbitrageOpportunities,
} from '@/lib/services/arbitrage';

/**
 * 检测套利机会
 */
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, params } = await request.json();

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    // 检测套利机会
    const opportunities = await detectArbitrageOpportunities(
      startTime,
      endTime,
      params
    );

    // 保存到数据库
    await saveArbitrageOpportunities(opportunities);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error('套利检测失败:', error);
    return NextResponse.json(
      { success: false, error: '套利检测失败' },
      { status: 500 }
    );
  }
}

