import axios from 'axios';

const BINANCE_API_BASE = 'https://api.binance.me/api/v3';

export interface BinanceTradeData {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
}

/**
 * 获取 Binance ETHUSDT 历史交易数据
 * @param startTime 开始时间戳（毫秒）
 * @param endTime 结束时间戳（毫秒）
 */
export async function fetchBinanceHistoricalTrades(
  symbol: string = 'ETHUSDT',
  startTime: number,
  endTime: number
): Promise<BinanceTradeData[]> {
  try {
    const allTrades: BinanceTradeData[] = [];
    let fromId: number | undefined;
    
    // Binance API 每次最多返回 100 条数据
    const limit = 100;
    
    while (true) {
      const params: any = {
        symbol,
        limit,
      };
      
      if (fromId) {
        params.fromId = fromId;
      }
      
      const response = await axios.get(`${BINANCE_API_BASE}/historicalTrades`, {
        params,
        headers: {
          'X-MBX-APIKEY': process.env.BINANCE_API_KEY || '',
        },
      });
      
      const trades = response.data as BinanceTradeData[];
      
      if (trades.length === 0) break;
      
      // 过滤时间范围内的交易
      const filteredTrades = trades.filter(
        trade => trade.time >= startTime && trade.time <= endTime
      );
      
      allTrades.push(...filteredTrades);
      
      // 如果最后一笔交易超过了结束时间，停止获取
      if (trades[trades.length - 1].time > endTime) break;
      
      fromId = trades[trades.length - 1].id + 1;
      
      // 避免触发 API 限制
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return allTrades;
  } catch (error) {
    console.error('获取 Binance 数据失败:', error);
    throw error;
  }
}

/**
 * 获取 Binance 聚合交易数据（不需要 API Key）
 */
export async function fetchBinanceAggTrades(
  symbol: string = 'ETHUSDT',
  startTime: number,
  endTime: number
): Promise<any[]> {
  const allTrades: any[] = [];
  const HOUR = 3600_000; // 1 小时毫秒数
  let currentStart = startTime;

  while (currentStart < endTime) {
    const chunkEnd = Math.min(currentStart + HOUR, endTime);

    const { data, status } = await axios.get(
      `${BINANCE_API_BASE}/aggTrades`,
      {
        params: { symbol, startTime: currentStart, endTime: chunkEnd, limit: 100 },
        validateStatus: (s) => s === 200,
      }
    );

    // 日志：看一条就够
    const url = new URL(`${BINANCE_API_BASE}/aggTrades`);
    Object.entries({ symbol, startTime: currentStart, endTime: chunkEnd, limit: 100 })
          .forEach(([k, v]) => url.searchParams.set(k, String(v)));
    console.log('[aggTrades 请求]', url.toString()); // ← 这里

    if (!Array.isArray(data) || data.length === 0) {
      // 本小时没数据，直接跳一小时
      currentStart = chunkEnd;
      continue;
    }

    allTrades.push(...data);
    currentStart = chunkEnd; // 关键：不管有没有数据，都往前跳 1 小时
    await new Promise((r) => setTimeout(r, 500)); // 限速 500ms
  }

  return allTrades;
}

/**
 * 获取当前价格
 */
export async function fetchBinanceCurrentPrice(symbol: string = 'ETHUSDT'): Promise<number> {
  try {
    const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`, {
      params: { symbol },
    });
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('获取 Binance 当前价格失败:', error);
    throw error;
  }
}

