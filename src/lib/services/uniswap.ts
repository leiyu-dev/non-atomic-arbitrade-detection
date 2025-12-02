import axios from 'axios';

const ETHERSCAN_API_BASE = 'https://api.etherscan.io/api';
const POOL_ADDRESS = '0x11b815efB8f581194ae79006d24E0d814B7697F6';

// The Graph API endpoint (Uniswap V3 Subgraph)
const UNISWAP_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export interface UniswapSwapEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  sender: string;
  recipient: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
  liquidity: string;
  tick: number;
}

/**
 * 使用 The Graph 获取 Uniswap V3 交易数据
 */
export async function fetchUniswapTrades(
  poolAddress: string = POOL_ADDRESS,
  startTimestamp: number,
  endTimestamp: number
): Promise<any[]> {
  try {
    const query = `
      query GetSwaps($poolAddress: String!, $startTime: Int!, $endTime: Int!) {
        swaps(
          first: 1000
          orderBy: timestamp
          orderDirection: asc
          where: {
            pool: $poolAddress
            timestamp_gte: $startTime
            timestamp_lte: $endTime
          }
        ) {
          id
          transaction {
            id
            blockNumber
            timestamp
          }
          timestamp
          sender
          recipient
          amount0
          amount1
          amountUSD
          sqrtPriceX96
          tick
          pool {
            token0 {
              symbol
              decimals
            }
            token1 {
              symbol
              decimals
            }
          }
        }
      }
    `;

    const response = await axios.post(UNISWAP_SUBGRAPH_URL, {
      query,
      variables: {
        poolAddress: poolAddress.toLowerCase(),
        startTime: Math.floor(startTimestamp / 1000),
        endTime: Math.floor(endTimestamp / 1000),
      },
    });

    return response.data.data.swaps || [];
  } catch (error) {
    console.error('获取 Uniswap 数据失败:', error);
    throw error;
  }
}

/**
 * 使用 Etherscan API 获取交易日志
 */
export async function fetchUniswapLogsFromEtherscan(
  poolAddress: string = POOL_ADDRESS,
  startBlock: number,
  endBlock: number
): Promise<any[]> {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY || '';
    
    // Swap event signature
    const swapTopic = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67';
    
    const response = await axios.get(ETHERSCAN_API_BASE, {
      params: {
        module: 'logs',
        action: 'getLogs',
        address: poolAddress,
        fromBlock: startBlock,
        toBlock: endBlock,
        topic0: swapTopic,
        apikey: apiKey,
      },
    });

    return response.data.result || [];
  } catch (error) {
    console.error('从 Etherscan 获取日志失败:', error);
    throw error;
  }
}

/**
 * 计算 Uniswap V3 的价格（从 sqrtPriceX96）
 */
export function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number
): number {
  const Q96 = BigInt(2) ** BigInt(96);
  const price = Number(sqrtPriceX96) / Number(Q96);
  const priceSquared = price * price;
  
  // 调整小数位
  const decimalAdjustment = 10 ** (decimals1 - decimals0);
  
  return priceSquared * decimalAdjustment;
}

/**
 * 模拟数据生成器（用于演示）
 * 在实际环境中，应该使用真实的 API 调用
 */
export async function generateMockUniswapData(
  startTimestamp: number,
  endTimestamp: number
): Promise<any[]> {
  const trades: any[] = [];
  const basePrice = 2500; // ETH 基础价格
  
  // 生成每小时的数据点
  for (let ts = startTimestamp; ts <= endTimestamp; ts += 3600000) {
    const randomVariation = (Math.random() - 0.5) * 100;
    const price = basePrice + randomVariation + Math.sin(ts / 86400000) * 50;
    
    trades.push({
      id: `mock-${ts}`,
      transaction: {
        id: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(20000000 + ts / 12000),
        timestamp: Math.floor(ts / 1000),
      },
      timestamp: Math.floor(ts / 1000),
      sender: '0x' + '0'.repeat(40),
      recipient: '0x' + '1'.repeat(40),
      amount0: (Math.random() * 10).toFixed(18),
      amount1: (Math.random() * 10 * price).toFixed(18),
      amountUSD: (Math.random() * 10000).toString(),
      sqrtPriceX96: BigInt(Math.floor(Math.sqrt(price) * 2 ** 96)).toString(),
      tick: Math.floor(Math.log(price) / Math.log(1.0001)),
      pool: {
        token0: { symbol: 'ETH', decimals: 18 },
        token1: { symbol: 'USDT', decimals: 6 },
      },
    });
  }
  
  return trades;
}

