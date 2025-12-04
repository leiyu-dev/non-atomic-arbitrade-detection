import { DuneClient, QueryParameter, ResultsResponse } from "@duneanalytics/client-sdk";

/**
 * Dune Analytics 查询结果类型定义
 * 基于查询 ID 6294574 的实际返回结构
 */
export interface DuneCexDexArbitrageRecord {
  block_number: number;
  block_time: string; // 格式: "YYYY-MM-DD HH:MM"
  tx_hash: string;
  tx_index: number;
  from_addr: string;
  to_addr: string;
  mev_bot_label: string | null;
  base_fees: number;
  priority_fees: number;
  cb_transfer: number;
  mev_value: number;
  volume: number;
  token_bought_amount: number;
  token_sold_amount: number;
  taker: string;
  token_bought_contract: string;
  token_sold_contract: string;
  token_bought_symbol: string;
  token_sold_symbol: string;
  pair: string;
  multi_trade: number;
}

/**
 * Dune Analytics 服务类
 * 用于获取已识别的 CEX-DEX 套利行为数据
 */
export class DuneService {
  private client: DuneClient;
  private readonly QUERY_ID = 6294574; // 论文相关查询 ID

  constructor(apiKey?: string) {
    const key = apiKey || process.env.DUNE_API_KEY;
    if (!key) {
      throw new Error(
        "DUNE_API_KEY 未设置。请在 .env 文件中配置或传入 apiKey 参数。"
      );
    }
    this.client = new DuneClient(key);
  }

  /**
   * 获取最新的 CEX-DEX 套利行为识别结果
   * 
   * 数据特征：
   * - 对 Uniswap V3 上 USDT/ETH 池进行分析
   * - 以太坊合约地址：0x11b815efB8f581194ae79006d24E0d814B7697F6
   * - 时间范围：2025年9月1日至9月30日
   * - 识别可能的 CEX-DEX 非原子套利行为
   * 
   * @returns Promise<DuneCexDexArbitrageRecord[]>
   */
  async getLatestCexDexArbitrages(): Promise<DuneCexDexArbitrageRecord[]> {
    try {
      const result = await this.client.getLatestResult({ 
        queryId: this.QUERY_ID,
        limit: 1
      });
      console.log(result);

      // 检查结果状态
      if (result.state !== "QUERY_STATE_COMPLETED") {
        throw new Error(`查询未完成，当前状态: ${result.state}`);
      }

      // 提取结果数据
      const rows = result.result?.rows || [];
      
      return rows.map((row: any) => ({
        block_number: Number(row.block_number),
        block_time: row.block_time,
        tx_hash: row.tx_hash,
        tx_index: Number(row.tx_index || 0),
        from_addr: row.from_addr,
        to_addr: row.to_addr,
        mev_bot_label: row.mev_bot_label || null,
        base_fees: Number(row.base_fees || 0),
        priority_fees: Number(row.priority_fees || 0),
        cb_transfer: Number(row.cb_transfer || 0),
        mev_value: Number(row.mev_value || 0),
        volume: Number(row.volume || 0),
        token_bought_amount: Number(row.token_bought_amount || 0),
        token_sold_amount: Number(row.token_sold_amount || 0),
        taker: row.taker,
        token_bought_contract: row.token_bought_contract,
        token_sold_contract: row.token_sold_contract,
        token_bought_symbol: row.token_bought_symbol,
        token_sold_symbol: row.token_sold_symbol,
        pair: row.pair,
        multi_trade: Number(row.multi_trade || 0),
      }));
    } catch (error) {
      console.error("获取 Dune Analytics 数据失败:", error);
      throw new Error(
        `无法从 Dune Analytics 获取数据: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 刷新查询数据（可选，如果需要最新数据）
   * 注意：这会消耗 Dune API 配额
   */
  async refreshQuery(parameters?: QueryParameter[]): Promise<ResultsResponse> {
    try {
      const result = await this.client.runQuery({
        queryId: this.QUERY_ID,
        query_parameters: parameters,

      });
      
      return result;
    } catch (error) {
      console.error("刷新查询失败:", error);
      throw error;
    }
  }

  /**
   * 获取查询元数据
   */
  async getQueryMetadata() {
    try {
      return await this.client.getLatestResult({ 
        queryId: this.QUERY_ID 
      });
    } catch (error) {
      console.error("获取查询元数据失败:", error);
      throw error;
    }
  }
}

/**
 * 创建 Dune 服务实例
 */
export function createDuneService(apiKey?: string): DuneService {
  return new DuneService(apiKey);
}

/**
 * 便捷函数：直接获取最新的 CEX-DEX 套利数据
 */
export async function fetchLatestCexDexArbitrages(
  apiKey?: string
): Promise<DuneCexDexArbitrageRecord[]> {
  const service = createDuneService(apiKey);
  return service.getLatestCexDexArbitrages();
}

