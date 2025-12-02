import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMockUniswapData } from '@/lib/services/uniswap';

/**
 * 获取并存储交易数据
 */
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    // 生成模拟 Uniswap 数据
    const uniswapTrades = await generateMockUniswapData(
      startTime.getTime(),
      endTime.getTime()
    );

    // 存储 Uniswap 数据
    for (const trade of uniswapTrades) {
      const price = parseFloat(trade.amountUSD) / parseFloat(trade.amount0);
      
      await prisma.uniswapTrade.upsert({
        where: { transactionHash: trade.transaction.id },
        update: {},
        create: {
          transactionHash: trade.transaction.id,
          blockNumber: trade.transaction.blockNumber,
          timestamp: new Date(trade.timestamp * 1000),
          poolAddress: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
          token0Amount: parseFloat(trade.amount0),
          token1Amount: parseFloat(trade.amount1),
          priceUSDT: price,
          sender: trade.sender,
          recipient: trade.recipient,
        },
      });
    }

    // 生成模拟 Binance 数据
    const binanceTrades = [];
    const basePrice = 2500;
    
    for (let ts = startTime.getTime(); ts <= endTime.getTime(); ts += 3600000) {
      const randomVariation = (Math.random() - 0.5) * 100;
      const price = basePrice + randomVariation + Math.sin(ts / 86400000) * 50;
      
      binanceTrades.push({
        tradeId: `binance-${ts}`,
        timestamp: new Date(ts),
        symbol: 'ETHUSDT',
        price: price + (Math.random() - 0.5) * 10,
        quantity: Math.random() * 5,
        isBuyerMaker: Math.random() > 0.5,
      });
    }

    // 存储 Binance 数据
    for (const trade of binanceTrades) {
      await prisma.binanceTrade.upsert({
        where: { tradeId: trade.tradeId },
        update: {},
        create: trade,
      });
    }

    return NextResponse.json({
      success: true,
      message: '数据获取成功',
      uniswapCount: uniswapTrades.length,
      binanceCount: binanceTrades.length,
    });
  } catch (error) {
    console.error('数据获取失败:', error);
    return NextResponse.json(
      { success: false, error: '数据获取失败' },
      { status: 500 }
    );
  }
}

