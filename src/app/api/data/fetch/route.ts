import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  readBinanceTradesFromCSV,
  readUniswapTradesFromCSV,
  getBinanceTradesCSVPath,
  getUniswapTradesCSVPath,
} from '@/lib/services/csv-reader';

/**
 * 从本地 CSV 文件获取并存储交易数据
 */
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    // 从本地 CSV 文件读取数据
    const binanceCSVPath = getBinanceTradesCSVPath();
    const uniswapCSVPath = getUniswapTradesCSVPath();

    console.log(`正在从本地 CSV 文件读取数据...`);
    console.log(`Binance CSV 路径: ${binanceCSVPath}`);
    console.log(`Uniswap CSV 路径: ${uniswapCSVPath}`);

    // 读取 CSV 文件
    const binanceTradesRaw = readBinanceTradesFromCSV(binanceCSVPath);
    const uniswapTradesRaw = readUniswapTradesFromCSV(uniswapCSVPath);

    console.log(`从 CSV 文件读取到 ${binanceTradesRaw.length} 条 Binance 交易记录`);
    console.log(`从 CSV 文件读取到 ${uniswapTradesRaw.length} 条 Uniswap 交易记录`);

    // 过滤时间范围内的数据
    const binanceTrades = binanceTradesRaw.filter(trade => {
      const tradeTime = new Date(trade.timestamp);
      return tradeTime >= startTime && tradeTime <= endTime;
    });

    const uniswapTrades = uniswapTradesRaw.filter(trade => {
      const tradeTime = new Date(trade.timestamp);
      return tradeTime >= startTime && tradeTime <= endTime;
    });

    console.log(`时间范围过滤后: ${binanceTrades.length} 条 Binance 交易, ${uniswapTrades.length} 条 Uniswap 交易`);

    // 删除数据库中所有原有数据
    console.log('正在删除数据库中的原有数据...');
    const [deletedBinanceCount, deletedUniswapCount] = await Promise.all([
      prisma.binanceTrade.deleteMany({}),
      prisma.uniswapTrade.deleteMany({}),
    ]);
    console.log(`已删除 ${deletedBinanceCount.count} 条 Binance 交易记录`);
    console.log(`已删除 ${deletedUniswapCount.count} 条 Uniswap 交易记录`);

    // 准备批量插入的数据
    const binanceData = binanceTrades.map(trade => ({
      tradeId: trade.tradeId,
      timestamp: new Date(trade.timestamp),
      symbol: trade.symbol,
      price: trade.price,
      quantity: trade.quantity,
      isBuyerMaker: trade.isBuyerMaker,
    }));

    const uniswapData = uniswapTrades.map(trade => ({
      transactionHash: trade.transactionHash,
      blockNumber: trade.blockNumber,
      timestamp: new Date(trade.timestamp),
      poolAddress: trade.poolAddress,
      token0Amount: trade.token0Amount,
      token1Amount: trade.token1Amount,
      priceUSDT: trade.priceUSDT,
      sender: trade.sender,
      recipient: trade.recipient,
    }));

    // 批量插入数据（分批处理，每批 1000 条）
    const BATCH_SIZE = 1000;
    let binanceCount = 0;
    let uniswapCount = 0;

    console.log('开始批量插入数据...');
``
    // 分批插入 Binance 数据
    for (let i = 0; i < binanceData.length; i += BATCH_SIZE) {
      const batch = binanceData.slice(i, i + BATCH_SIZE);
      await prisma.binanceTrade.createMany({
        data: batch,
      });
    }

    // 分批插入 Uniswap 数据
    for (let i = 0; i < uniswapData.length; i += BATCH_SIZE) {
      const batch = uniswapData.slice(i, i + BATCH_SIZE);
      await prisma.uniswapTrade.createMany({
        data: batch,
      });
    }

    // 等待所有插入完成
    return NextResponse.json({
      success: true,
      message: '从本地 CSV 文件获取数据成功',
      uniswapCount,
      binanceCount,
    });
  } catch (error) {
    console.error('从本地 CSV 文件获取数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '从本地 CSV 文件获取数据失败',
      },
      { status: 500 }
    );
  }
}

