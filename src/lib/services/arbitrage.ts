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
  minProfitPercent: number; // 最小利润百分比阈值
  tradeAmountETH: number; // 交易金额（ETH）
  tradingFeePercent: number; // 交易手续费百分比
  slippagePercent: number; // 滑点百分比
}

const DEFAULT_PARAMS: ArbitrageDetectionParams = {
  minProfitPercent: 0.5, // 0.5% 最小利润
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
  params: ArbitrageDetectionParams = DEFAULT_PARAMS
): Promise<ArbitrageDetectionResult[]> {
  // 获取时间范围内的交易数据
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

  const opportunities: ArbitrageDetectionResult[] = [];

  // 使用滑动窗口方法匹配时间接近的交易
  const timeWindowMs = 60000; // 1分钟时间窗口

  for (const uniswapTrade of uniswapTrades) {
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

    // 只记录超过最小利润阈值的机会
    const profitPercent =
      (potentialProfitUSDT /
        (Math.min(uniswapPrice, binancePrice) * params.tradeAmountETH)) *
      100;

    if (profitPercent >= params.minProfitPercent) {
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

  return opportunities;
}

/**
 * 保存套利机会到数据库
 */
export async function saveArbitrageOpportunities(
  opportunities: ArbitrageDetectionResult[]
): Promise<void> {
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
  }
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

