import { prisma } from '../prisma';

export interface ArbitrageDetectionResult {
  timestamp: Date;
  uniswapPrice: number;
  binancePrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  potentialProfitUSDT: number;
  tradeAmount: number;
  direction: 'buy_uniswap_sell_binance' | 'buy_binance_sell_uniswap';
}

/**
 * 套利检测参数
 */
export interface ArbitrageDetectionParams {
  tradeAmountETH: number; // 交易金额（ETH）
  tradingFeePercent: number; // 交易手续费百分比
  slippagePercent: number; // 滑点百分比
}

const DEFAULT_PARAMS: ArbitrageDetectionParams = {
  tradeAmountETH: 1, // 1 ETH 交易金额
  tradingFeePercent: 0.3, // 0.3% 交易手续费 (Uniswap V3 + Binance)
  slippagePercent: 0.1, // 0.1% 滑点
};

/**
 * 检测套利机会
 */
export async function detectArbitrageOpportunities(
  startTime: Date,
  endTime: Date,
  params: ArbitrageDetectionParams = DEFAULT_PARAMS,
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
    foundOpportunities: number;
  }) => void
): Promise<ArbitrageDetectionResult[]> {
  console.log('开始检测套利机会...');
  console.log(`时间范围: ${startTime.toISOString()} 至 ${endTime.toISOString()}`);
  
  // 获取时间范围内的交易数据
  console.log('正在获取交易数据...');
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

  console.log(`获取到 ${uniswapTrades.length} 条 Uniswap 交易数据`);
  console.log(`获取到 ${binanceTrades.length} 条 Binance 交易数据`);

  const opportunities: ArbitrageDetectionResult[] = [];

  // 使用滑动窗口方法匹配时间接近的交易
  const timeWindowMs = 60000; // 1分钟时间窗口

  const totalTrades = uniswapTrades.length;
  let processedCount = 0;
  const progressInterval = Math.max(1, Math.floor(totalTrades / 100)); // 每1%输出一次进度

  console.log('开始分析交易数据...');
  for (const uniswapTrade of uniswapTrades) {
    processedCount++;
    
    // 输出进度
    if (processedCount % progressInterval === 0 || processedCount === totalTrades) {
      const percentage = Math.round((processedCount / totalTrades) * 100);
      console.log(`检测进度: ${processedCount}/${totalTrades} (${percentage}%) - 已发现 ${opportunities.length} 个套利机会`);
      
      if (onProgress) {
        onProgress({
          current: processedCount,
          total: totalTrades,
          percentage,
          foundOpportunities: opportunities.length,
        });
      }
    }
    // 找到时间窗口内最接近的 Binance 交易
    const matchingBinanceTrades = binanceTrades.filter(
      bt =>
        Math.abs(bt.timestamp.getTime() - uniswapTrade.timestamp.getTime()) <=
        timeWindowMs
    );

    if (matchingBinanceTrades.length === 0) continue;

    // 使用平均价格
    const avgBinancePrice =
      matchingBinanceTrades.reduce((sum, t) => sum + t.price, 0) /
      matchingBinanceTrades.length;

    const uniswapPrice = uniswapTrade.priceUSDT;
    const binancePrice = avgBinancePrice;

    // 计算价格差异
    const priceDifference = Math.abs(uniswapPrice - binancePrice);
    const priceDifferencePercent =
      (priceDifference / Math.min(uniswapPrice, binancePrice)) * 100;

    // 确定套利方向
    let direction: 'buy_uniswap_sell_binance' | 'buy_binance_sell_uniswap';
    let potentialProfitUSDT: number;

    if (uniswapPrice < binancePrice) {
      // 在 Uniswap 买入，在 Binance 卖出
      direction = 'buy_uniswap_sell_binance';
      const buyPrice = uniswapPrice * (1 + params.slippagePercent / 100);
      const sellPrice = binancePrice * (1 - params.slippagePercent / 100);
      const grossProfit =
        (sellPrice - buyPrice) * params.tradeAmountETH;
      const fees =
        (buyPrice + sellPrice) *
        params.tradeAmountETH *
        (params.tradingFeePercent / 100);
      potentialProfitUSDT = grossProfit - fees;
    } else {
      // 在 Binance 买入，在 Uniswap 卖出
      direction = 'buy_binance_sell_uniswap';
      const buyPrice = binancePrice * (1 + params.slippagePercent / 100);
      const sellPrice = uniswapPrice * (1 - params.slippagePercent / 100);
      const grossProfit =
        (sellPrice - buyPrice) * params.tradeAmountETH;
      const fees =
        (buyPrice + sellPrice) *
        params.tradeAmountETH *
        (params.tradingFeePercent / 100);
      potentialProfitUSDT = grossProfit - fees;
    }

    // 只要有可能盈利就记录为套利机会
    if (potentialProfitUSDT > 0) {
      opportunities.push({
        timestamp: uniswapTrade.timestamp,
        uniswapPrice,
        binancePrice,
        priceDifference,
        priceDifferencePercent,
        potentialProfitUSDT,
        tradeAmount: params.tradeAmountETH,
        direction,
      });
    }
  }

  console.log(`检测完成！共发现 ${opportunities.length} 个套利机会`);
  
  if (onProgress) {
    onProgress({
      current: totalTrades,
      total: totalTrades,
      percentage: 100,
      foundOpportunities: opportunities.length,
    });
  }

  return opportunities;
}

/**
 * 保存套利机会到数据库
 */
export async function saveArbitrageOpportunities(
  opportunities: ArbitrageDetectionResult[],
  deleteExisting: boolean = true
): Promise<void> {
  // 删除之前的套利机会
  if (deleteExisting) {
    console.log('正在删除之前的套利机会...');
    const deletedCount = await prisma.arbitrageOpportunity.deleteMany({});
    console.log(`已删除 ${deletedCount.count} 个之前的套利机会`);
  }

  if (opportunities.length === 0) {
    console.log('没有套利机会需要保存');
    return;
  }

  console.log(`开始保存 ${opportunities.length} 个套利机会到数据库...`);
  const total = opportunities.length;
  let savedCount = 0;
  const progressInterval = Math.max(1, Math.floor(total / 20)); // 每5%输出一次进度

  for (const opp of opportunities) {
    await prisma.arbitrageOpportunity.create({
      data: {
        timestamp: opp.timestamp,
        uniswapPrice: opp.uniswapPrice,
        binancePrice: opp.binancePrice,
        priceDifference: opp.priceDifference,
        priceDifferencePercent: opp.priceDifferencePercent,
        potentialProfitUSDT: opp.potentialProfitUSDT,
        tradeAmount: opp.tradeAmount,
        direction: opp.direction,
      },
    });
    
    savedCount++;
    if (savedCount % progressInterval === 0 || savedCount === total) {
      const percentage = Math.round((savedCount / total) * 100);
      console.log(`保存进度: ${savedCount}/${total} (${percentage}%)`);
    }
  }

  console.log(`保存完成！已保存 ${savedCount} 个套利机会到数据库`);
}

/**
 * 分析套利统计信息
 */
export async function getArbitrageStatistics(
  startTime: Date,
  endTime: Date
): Promise<{
  totalOpportunities: number;
  totalPotentialProfit: number;
  averageProfitPerOpportunity: number;
  maxProfit: number;
  minProfit: number;
  buyUniswapCount: number;
  buyBinanceCount: number;
}> {
  const opportunities = await prisma.arbitrageOpportunity.findMany({
    where: {
      timestamp: {
        gte: startTime,
        lte: endTime,
      },
    },
  });

  if (opportunities.length === 0) {
    return {
      totalOpportunities: 0,
      totalPotentialProfit: 0,
      averageProfitPerOpportunity: 0,
      maxProfit: 0,
      minProfit: 0,
      buyUniswapCount: 0,
      buyBinanceCount: 0,
    };
  }

  const totalPotentialProfit = opportunities.reduce(
    (sum, opp) => sum + opp.potentialProfitUSDT,
    0
  );
  const maxProfit = Math.max(
    ...opportunities.map(opp => opp.potentialProfitUSDT)
  );
  const minProfit = Math.min(
    ...opportunities.map(opp => opp.potentialProfitUSDT)
  );
  const buyUniswapCount = opportunities.filter(
    opp => opp.direction === 'buy_uniswap_sell_binance'
  ).length;
  const buyBinanceCount = opportunities.filter(
    opp => opp.direction === 'buy_binance_sell_uniswap'
  ).length;

  return {
    totalOpportunities: opportunities.length,
    totalPotentialProfit,
    averageProfitPerOpportunity: totalPotentialProfit / opportunities.length,
    maxProfit,
    minProfit,
    buyUniswapCount,
    buyBinanceCount,
  };
}

