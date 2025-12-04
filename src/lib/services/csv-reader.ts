import * as fs from 'fs';
import * as path from 'path';
import { DuneCexDexArbitrageRecord } from './dune';

/**
 * 从本地 CSV 文件读取 CEX-DEX 套利数据
 */
export function readCexDexArbitrageFromCSV(csvPath: string): DuneCexDexArbitrageRecord[] {
  try {
    // 读取 CSV 文件
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return [];
    }

    // 解析标题行
    const headers = lines[0].split(',');
    const records: DuneCexDexArbitrageRecord[] = [];

    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`第 ${i + 1} 行字段数量不匹配，跳过`);
        continue;
      }

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // 转换为 DuneCexDexArbitrageRecord 格式
      records.push({
        block_number: parseInt(record.block_number) || 0,
        block_time: formatBlockTime(record.block_time),
        tx_hash: record.tx_hash || '',
        tx_index: parseInt(record.tx_index) || 0,
        from_addr: record.from_addr || '',
        to_addr: record.to_addr || '',
        mev_bot_label: record.mev_bot_label || null,
        base_fees: parseFloat(record.base_fees) || 0,
        priority_fees: parseFloat(record.priority_fees) || 0,
        cb_transfer: parseFloat(record.cb_transfer) || 0,
        mev_value: parseFloat(record.mev_value) || 0,
        volume: parseFloat(record.volume) || 0,
        token_bought_amount: parseFloat(record.token_bought_amount) || 0,
        token_sold_amount: parseFloat(record.token_sold_amount) || 0,
        taker: record.taker || '',
        token_bought_contract: record.token_bought_contract || '',
        token_sold_contract: record.token_sold_contract || '',
        token_bought_symbol: record.token_bought_symbol || '',
        token_sold_symbol: record.token_sold_symbol || '',
        pair: record.pair || '',
        multi_trade: parseInt(record.multi_trade) || 0,
      });
    }

    return records;
  } catch (error) {
    console.error('读取 CSV 文件失败:', error);
    throw new Error(`无法读取 CSV 文件: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解析 CSV 行，处理引号内的逗号
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * 格式化 block_time 为标准格式
 * 支持多种输入格式:
 * - "2025-09-06 22:03:47.000 UTC" (新格式)
 * - "2025/9/22 6:49" (旧格式)
 * 输出: "2025-09-22 22:03:47"
 */
function formatBlockTime(blockTime: string): string {
  try {
    if (!blockTime) return '';

    // 去除 UTC 后缀
    let timeStr = blockTime.replace(' UTC', '').trim();

    // 情况 1: 已经是标准格式 "2025-09-06 22:03:47.000" 或 "2025-09-06 22:03:47"
    if (timeStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      // 去除毫秒部分
      return timeStr.split('.')[0];
    }

    // 情况 2: 旧格式 "2025/9/22 6:49"
    const parts = timeStr.split(' ');
    if (parts.length >= 2) {
      const datePart = parts[0].split('/');
      const timePart = parts[1].split(':');

      if (datePart.length === 3) {
        const year = datePart[0];
        const month = datePart[1].padStart(2, '0');
        const day = datePart[2].padStart(2, '0');
        const hour = timePart[0]?.padStart(2, '0') || '00';
        const minute = timePart[1]?.padStart(2, '0') || '00';
        const second = timePart[2]?.padStart(2, '0') || '00';

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
    }

    // 无法解析，返回原始值
    return blockTime;
  } catch (error) {
    console.warn('格式化时间失败:', blockTime, error);
    return blockTime;
  }
}

/**
 * 获取默认 CSV 文件路径（单个文件，保留用于兼容）
 */
export function getDefaultCSVPath(): string {
  return path.join(process.cwd(), 'test', 'data.csv');
}

/**
 * 获取所有 CEX-DEX 数据 CSV 文件路径
 * 按顺序读取 data/data1.csv 到 data/data4.csv
 */
export function getDefaultCSVPaths(): string[] {
  const dataDir = path.join(process.cwd(), 'data');
  const paths: string[] = [];
  
  // 尝试读取 data1.csv 到 data4.csv
  for (let i = 1; i <= 5; i++) {
    const filePath = path.join(dataDir, `data${i}.csv`);
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      paths.push(filePath);
    }
  }
  
  return paths;
}

/**
 * 从多个 CSV 文件读取并合并 CEX-DEX 套利数据
 */
export function readCexDexArbitrageFromMultipleCSV(csvPaths: string[]): DuneCexDexArbitrageRecord[] {
  const allRecords: DuneCexDexArbitrageRecord[] = [];
  const txHashSet = new Set<string>(); // 用于去重

  for (const csvPath of csvPaths) {
    try {
      console.log(`正在读取文件: ${csvPath}`);
      const records = readCexDexArbitrageFromCSV(csvPath);
      
      // 去重：只添加未出现过的交易
      let addedCount = 0;
      for (const record of records) {
        if (!txHashSet.has(record.tx_hash)) {
          allRecords.push(record);
          txHashSet.add(record.tx_hash);
          addedCount++;
        }
      }
      
      console.log(`从 ${path.basename(csvPath)} 读取 ${records.length} 条记录，去重后添加 ${addedCount} 条`);
    } catch (error) {
      console.error(`读取文件 ${csvPath} 失败:`, error);
      // 继续读取其他文件
    }
  }

  console.log(`总共读取 ${allRecords.length} 条唯一记录`);
  return allRecords;
}

