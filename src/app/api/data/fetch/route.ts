import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  readBinanceTradesFromCSV,
  readUniswapTradesFromCSV,
  getBinanceTradesCSVPath,
  getUniswapTradesCSVPath,
} from '@/lib/services/csv-reader';
import { fetchUniswapTradesFromDune } from '@/lib/services/uniswap';
import { fetchBinanceAggTrades } from '@/lib/services/binance';

/**
 * 从本地 CSV 文件获取并存储交易数据
 */
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();
    // ... 日期验证代码不变 ...

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

  //真实数据：
  try {
    const { startDate, endDate } = await request.json();
    // ... 日期验证代码不变 ...

    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    // === 1. 改为从 Dune 获取 Uniswap 数据 ===
    console.log('Fetching Uniswap trades from Dune...');
    const uniswapTrades = await fetchUniswapTradesFromDune( // 调用新函数
      '0x11b815efB8f581194ae79006d24E0d814b7697F6',
      startTime,
      endTime
    );

    // 存储 Uniswap 数据
    for (const trade of uniswapTrades) {
        // 1. 定义代币精度
      const TOKEN0_DECIMALS = 18; // ETH 或 WETH
      const TOKEN1_DECIMALS = 6;  // USDT

      // 2. 将原始字符串转换为可读数量
      const amount0Raw = BigInt(trade.amount0);
      const amount1Raw = BigInt(trade.amount1);
      
      const amount0 = Number(amount0Raw) / (10 ** TOKEN0_DECIMALS);
      const amount1 = Number(amount1Raw) / (10 ** TOKEN1_DECIMALS);

      // ========== 【核心修复开始】 ==========
      // 3. 检查除数是否为0或极小值，避免无效计算
      if (Math.abs(amount0) < 0.00000001) { // 设置一个极小的阈值，例如 1e-8
        console.warn(`跳过交易 ${trade.transactionHash}，token0数量过小或为零: ${amount0}`);
        continue; // 跳过此笔交易，不存入数据库
      }
      
      // 4. 计算价格（此时amount0安全不为零）
      const priceUSDT = Math.abs(amount1) / Math.abs(amount0);

      // 5. 存储（现在存储的是用户可读的数量，而非原始链上数据）
      await prisma.uniswapTrade.upsert({
        where: { transactionHash: trade.transactionHash },
        update: {
          token0Amount: amount0, // 例如 2.17354984730897
          token1Amount: amount1, // 例如 -9565.983273
          priceUSDT: priceUSDT,  // 例如 4400.87 （=9565.98/2.1735）
        },
        create: {
          transactionHash: trade.transactionHash,
          blockNumber: trade.blockNumber,
          timestamp: new Date(trade.timestamp),
          poolAddress: '0x11b815efB8f581194ae79006d24E0d814b7697F6',
          token0Amount: amount0, // 例如 2.17354984730897
          token1Amount: amount1, // 例如 -9565.983273
          priceUSDT: priceUSDT,  // 例如 4400.87 （=9565.98/2.1735）
          sender: trade.sender,
          recipient: trade.recipient,
        },
      });
    }

    // === 2. 从 Binance 获取真实数据 ===
    console.log('从 Binance 获取聚合交易数据...');
    let binanceAggTrades = [];
    let binanceStoredCount = 0;
    
    try {
      binanceAggTrades = await fetchBinanceAggTrades('ETHUSDT', startTime, endTime);
      console.log(`从 Binance 获取到 ${binanceAggTrades.length} 条聚合交易`);
      
      // 存储 Binance 数据
      for (const trade of binanceAggTrades) {
        try {
          const price = parseFloat(trade.p);
          const quantity = parseFloat(trade.q);
          const timestamp = new Date(trade.T);
          const isBuyerMaker = trade.m; // m=true 表示卖方是主动方，即买方是挂单方
          
          // 构建唯一 tradeId
          const tradeId = `binance-${trade.a}`;
          
          await prisma.binanceTrade.upsert({
            where: { tradeId },
            update: {},
            create: {
              tradeId,
              timestamp,
              symbol: 'ETHUSDT',
              price,
              quantity,
              isBuyerMaker,
            },
          });
          binanceStoredCount++;
        } catch (tradeError) {
          console.error(`处理 Binance 交易失败:`, tradeError);
        }
      }
    } catch (error) {
      console.error('从 Binance 获取数据失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `从 Binance 获取数据失败: ${'未知错误'}` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '数据获取成功 (来源: Dune)',
      uniswapCount: uniswapTrades.length,
      binanceCount: binanceAggTrades?.length || 0,
    });
  } catch (error: any) {
    console.error('获取真实数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '未知错误' },
      { status: 500 }
    );
  }


}