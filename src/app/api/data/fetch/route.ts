import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchUniswapTradesFromDune } from '@/lib/services/uniswap'; // 确保导出这个新函数
import { fetchBinanceAggTrades } from '@/lib/services/binance';


export async function POST(request: NextRequest) {
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