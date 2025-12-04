import { prisma } from '../prisma';
import { DuneCexDexArbitrageRecord, fetchLatestCexDexArbitrages } from './dune';
import { 
  readCexDexArbitrageFromCSV, 
  readCexDexArbitrageFromMultipleCSV,
  getDefaultCSVPath,
  getDefaultCSVPaths 
} from './csv-reader';

/**
 * CEX-DEX 套利行为识别结果类型
 */
export interface CexDexArbitrageResult {
  id: string;
  txHash: string;
  blockNumber: number;
  blockTime: Date;
  txIndex: number;
  fromAddr: string;
  toAddr: string;
  taker: string;
  mevBotLabel?: string;
  baseFees: number;
  priorityFees: number;
  cbTransfer: number;
  mevValue: number;
  volume: number;
  tokenBoughtSymbol: string;
  tokenSoldSymbol: string;
  tokenBoughtContract: string;
  tokenSoldContract: string;
  tokenBoughtAmount: number;
  tokenSoldAmount: number;
  pair: string;
  multiTrade: number;
}

/**
 * 从本地 CSV 文件获取并保存 CEX-DEX 套利行为数据
 * 
 * 基于论文 2507.13023v3 的方法识别套利行为：
 * - 分析 Uniswap V3 USDT/ETH 池 (0x11b815efB8f581194ae79006d24E0d814B7697F6)
 * - 时间范围：2025年9月1日至9月30日
 * - 识别可能的 CEX-DEX 非原子套利行为
 * 
 * @param forceRefresh 是否强制刷新数据（默认 false）
 * @param csvPath CSV 文件路径（可选，默认使用 data/data1-4.csv）
 * @returns Promise<CexDexArbitrageResult[]>
 */
export async function fetchAndSaveCexDexArbitrages(
  forceRefresh: boolean = false,
  csvPath?: string
): Promise<CexDexArbitrageResult[]> {
  try {
    let duneData;
    
    // 如果指定了单个文件路径，使用单文件读取
    if (csvPath) {
      console.log(`正在从指定 CSV 文件读取数据: ${csvPath}`);
      duneData = readCexDexArbitrageFromCSV(csvPath);
    } else {
      // 否则读取所有 data1-4.csv 文件
      const csvPaths = getDefaultCSVPaths();
      console.log(`正在从多个 CSV 文件读取 CEX-DEX 套利数据...`);
      console.log(`找到 ${csvPaths.length} 个数据文件`);
      duneData = readCexDexArbitrageFromMultipleCSV(csvPaths);
    }
    
    console.log(`成功读取 ${duneData.length} 条记录`);

    const results: CexDexArbitrageResult[] = [];

    // 批量保存到数据库
    for (const record of duneData) {
      try {
        // 检查是否已存在
        const existing = await prisma.cexDexArbitrage.findUnique({
          where: { txHash: record.tx_hash },
        });

        // 解析 block_time，支持多种格式:
        // - "YYYY-MM-DD HH:MM:SS" (新格式)
        // - "YYYY-MM-DD HH:MM" (旧格式)
        let blockTime: Date;
        if (record.block_time.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
          // 已包含秒数
          blockTime = new Date(record.block_time.replace(' ', 'T') + 'Z');
        } else {
          // 不包含秒数，添加 :00
          blockTime = new Date(record.block_time.replace(' ', 'T') + ':00Z');
        }

        let saved;
        if (existing && !forceRefresh) {
          // 已存在且不强制刷新，跳过
          saved = existing;
        } else if (existing && forceRefresh) {
          // 已存在但强制刷新，更新数据
          saved = await prisma.cexDexArbitrage.update({
            where: { txHash: record.tx_hash },
            data: {
              blockNumber: record.block_number,
              blockTime: blockTime,
              txIndex: record.tx_index,
              fromAddr: record.from_addr,
              toAddr: record.to_addr,
              taker: record.taker,
              mevBotLabel: record.mev_bot_label,
              baseFees: record.base_fees,
              priorityFees: record.priority_fees,
              cbTransfer: record.cb_transfer,
              mevValue: record.mev_value,
              volume: record.volume,
              tokenBoughtSymbol: record.token_bought_symbol,
              tokenSoldSymbol: record.token_sold_symbol,
              tokenBoughtContract: record.token_bought_contract,
              tokenSoldContract: record.token_sold_contract,
              tokenBoughtAmount: record.token_bought_amount,
              tokenSoldAmount: record.token_sold_amount,
              pair: record.pair,
              multiTrade: record.multi_trade,
              duneQueryId: 6294574,
              duneDataFetched: true,
            },
          });
        } else {
          // 不存在，创建新记录
          saved = await prisma.cexDexArbitrage.create({
            data: {
              txHash: record.tx_hash,
              blockNumber: record.block_number,
              blockTime: blockTime,
              txIndex: record.tx_index,
              fromAddr: record.from_addr,
              toAddr: record.to_addr,
              taker: record.taker,
              mevBotLabel: record.mev_bot_label,
              baseFees: record.base_fees,
              priorityFees: record.priority_fees,
              cbTransfer: record.cb_transfer,
              mevValue: record.mev_value,
              volume: record.volume,
              tokenBoughtSymbol: record.token_bought_symbol,
              tokenSoldSymbol: record.token_sold_symbol,
              tokenBoughtContract: record.token_bought_contract,
              tokenSoldContract: record.token_sold_contract,
              tokenBoughtAmount: record.token_bought_amount,
              tokenSoldAmount: record.token_sold_amount,
              pair: record.pair,
              multiTrade: record.multi_trade,
              duneQueryId: 6294574,
              duneDataFetched: true,
            },
          });
        }

        results.push({
          id: saved.id,
          txHash: saved.txHash,
          blockNumber: saved.blockNumber,
          blockTime: saved.blockTime,
          txIndex: saved.txIndex,
          fromAddr: saved.fromAddr,
          toAddr: saved.toAddr,
          taker: saved.taker,
          mevBotLabel: saved.mevBotLabel || undefined,
          baseFees: saved.baseFees,
          priorityFees: saved.priorityFees,
          cbTransfer: saved.cbTransfer,
          mevValue: saved.mevValue,
          volume: saved.volume,
          tokenBoughtSymbol: saved.tokenBoughtSymbol,
          tokenSoldSymbol: saved.tokenSoldSymbol,
          tokenBoughtContract: saved.tokenBoughtContract,
          tokenSoldContract: saved.tokenSoldContract,
          tokenBoughtAmount: saved.tokenBoughtAmount,
          tokenSoldAmount: saved.tokenSoldAmount,
          pair: saved.pair,
          multiTrade: saved.multiTrade,
        });
      } catch (error) {
        console.error(
          `保存交易 ${record.tx_hash} 失败:`,
          error
        );
      }
    }

    console.log(`成功保存 ${results.length} 条 CEX-DEX 套利记录`);
    return results;
  } catch (error) {
    console.error('获取和保存 CEX-DEX 套利数据失败:', error);
    throw error;
  }
}

/**
 * 从数据库获取 CEX-DEX 套利行为数据
 * 
 * @param options 查询选项
 * @returns Promise<CexDexArbitrageResult[]>
 */
export async function getCexDexArbitrages(options?: {
  startDate?: Date;
  endDate?: Date;
  searcherAddress?: string;
  limit?: number;
  offset?: number;
}): Promise<CexDexArbitrageResult[]> {
  const where: any = {};

  if (options?.startDate || options?.endDate) {
    where.blockTime = {};
    if (options.startDate) {
      where.blockTime.gte = options.startDate;
    }
    if (options.endDate) {
      where.blockTime.lte = options.endDate;
    }
  }

  if (options?.searcherAddress) {
    where.fromAddr = options.searcherAddress;
  }

  const records = await prisma.cexDexArbitrage.findMany({
    where,
    orderBy: { blockTime: 'desc' },
    take: options?.limit,
    skip: options?.offset,
  });

  return records.map(record => ({
    id: record.id,
    txHash: record.txHash,
    blockNumber: record.blockNumber,
    blockTime: record.blockTime,
    txIndex: record.txIndex,
    fromAddr: record.fromAddr,
    toAddr: record.toAddr,
    taker: record.taker,
    mevBotLabel: record.mevBotLabel || undefined,
    baseFees: record.baseFees,
    priorityFees: record.priorityFees,
    cbTransfer: record.cbTransfer,
    mevValue: record.mevValue,
    volume: record.volume,
    tokenBoughtSymbol: record.tokenBoughtSymbol,
    tokenSoldSymbol: record.tokenSoldSymbol,
    tokenBoughtContract: record.tokenBoughtContract,
    tokenSoldContract: record.tokenSoldContract,
    tokenBoughtAmount: record.tokenBoughtAmount,
    tokenSoldAmount: record.tokenSoldAmount,
    pair: record.pair,
    multiTrade: record.multiTrade,
  }));
}

/**
 * 获取 CEX-DEX 套利统计信息
 * 
 * @param options 查询选项
 * @returns Promise<统计信息>
 */
export async function getCexDexArbitrageStatistics(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (options?.startDate || options?.endDate) {
    where.blockTime = {};
    if (options.startDate) {
      where.blockTime.gte = options.startDate;
    }
    if (options.endDate) {
      where.blockTime.lte = options.endDate;
    }
  }

  const [
    totalCount,
    records,
    searcherStats,
  ] = await Promise.all([
    // 总交易数
    prisma.cexDexArbitrage.count({ where }),
    
    // 获取所有记录用于计算
    prisma.cexDexArbitrage.findMany({
      where,
      select: {
        mevValue: true,
        volume: true,
        baseFees: true,
        priorityFees: true,
      },
    }),
    
    // 按搜索者统计
    prisma.cexDexArbitrage.groupBy({
      by: ['fromAddr', 'mevBotLabel'],
      where,
      _count: { id: true },
      _sum: {
        mevValue: true,
        volume: true,
      },
    }),
  ]);

  // 计算总 MEV 价值和交易量
  const totalMevValue = records.reduce(
    (sum, r) => sum + (r.mevValue || 0),
    0
  );
  const totalVolume = records.reduce(
    (sum, r) => sum + (r.volume || 0),
    0
  );
  const totalGasCost = records.reduce(
    (sum, r) => sum + (r.baseFees || 0) + (r.priorityFees || 0),
    0
  );

  // 按搜索者排序（按交易数降序）
  const topSearchers = searcherStats
    .map(s => ({
      address: s.fromAddr,
      name: s.mevBotLabel || '未知',
      count: s._count.id,
      totalMevValue: s._sum.mevValue || 0,
      totalVolume: s._sum.volume || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 前10名

  return {
    totalTransactions: totalCount,
    totalMevValueETH: totalMevValue,
    totalVolumeUSD: totalVolume,
    totalGasCostETH: totalGasCost,
    averageMevValuePerTransaction: totalCount > 0 ? totalMevValue / totalCount : 0,
    averageVolumePerTransaction: totalCount > 0 ? totalVolume / totalCount : 0,
    uniqueSearchers: searcherStats.length,
    topSearchers,
  };
}

/**
 * 获取指定搜索者的套利行为详情
 * 
 * @param searcherAddress 搜索者地址
 * @returns Promise<搜索者统计信息>
 */
export async function getSearcherDetails(searcherAddress: string) {
  const records = await prisma.cexDexArbitrage.findMany({
    where: { fromAddr: searcherAddress },
    orderBy: { blockTime: 'desc' },
  });

  const totalMevValue = records.reduce(
    (sum, r) => sum + (r.mevValue || 0),
    0
  );
  const totalVolume = records.reduce(
    (sum, r) => sum + (r.volume || 0),
    0
  );
  const totalGasCost = records.reduce(
    (sum, r) => sum + (r.baseFees || 0) + (r.priorityFees || 0),
    0
  );

  return {
    searcherAddress,
    searcherName: records[0]?.mevBotLabel || '未知',
    totalTransactions: records.length,
    totalMevValueETH: totalMevValue,
    totalVolumeUSD: totalVolume,
    totalGasCostETH: totalGasCost,
    averageMevValuePerTransaction: records.length > 0 ? totalMevValue / records.length : 0,
    averageVolumePerTransaction: records.length > 0 ? totalVolume / records.length : 0,
    firstTransaction: records[records.length - 1]?.blockTime,
    lastTransaction: records[0]?.blockTime,
    transactions: records.map(r => ({
      txHash: r.txHash,
      blockNumber: r.blockNumber,
      blockTime: r.blockTime,
      pair: r.pair,
      mevValue: r.mevValue,
      volume: r.volume,
      baseFees: r.baseFees,
      priorityFees: r.priorityFees,
    })),
  };
}

