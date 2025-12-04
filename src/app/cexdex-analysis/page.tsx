'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Link,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';

interface CexDexArbitrage {
  id: string;
  txHash: string;
  blockNumber: number;
  blockTime: string;
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

interface Statistics {
  totalTransactions: number;
  totalMevValueETH: number;
  totalVolumeUSD: number;
  totalGasCostETH: number;
  averageMevValuePerTransaction: number;
  averageVolumePerTransaction: number;
  uniqueSearchers: number;
  topSearchers: Array<{
    address: string;
    name: string;
    count: number;
    totalMevValue: number;
    totalVolume: number;
  }>;
}

export default function CexDexAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [arbitrages, setArbitrages] = useState<CexDexArbitrage[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [limit, setLimit] = useState(100);

  // 获取数据
  const fetchData = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await axios.post('/api/cexdex/fetch', {
        forceRefresh,
      });
      
      if (response.data.success) {
        alert(`成功获取 ${response.data.count} 条套利记录`);
        // 刷新列表和统计
        await loadArbitrages();
        await loadStatistics();
      }
    } catch (err) {
      console.error('获取数据失败:', err);
      setError(axios.isAxiosError(err) && err.response?.data?.details 
        ? err.response.data.details 
        : '获取数据失败，请检查 DUNE_API_KEY 配置');
    } finally {
      setFetching(false);
    }
  };

  // 加载套利列表（获取所有数据用于图表分析）
  const loadArbitrages = async () => {
    setLoading(true);
    setError(null);
    try {
      // 不传 limit 参数，获取所有数据
      const response = await axios.get('/api/cexdex/list');
      if (response.data.success) {
        setArbitrages(response.data.data);
      }
    } catch (err) {
      console.error('加载套利列表失败:', err);
      setError('加载套利列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const response = await axios.get('/api/cexdex/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('加载统计信息失败:', err);
    }
  };

  // 初始加载
  useEffect(() => {
    loadArbitrages();
    loadStatistics();
  }, []);

  // 图表配置函数
  // 1. MEV 价值时间趋势图
  const getMevTimelineChartOption = () => {
    if (arbitrages.length === 0) return {};

    const dailyData = new Map<string, { mevValue: number; count: number }>();
    
    arbitrages.forEach(arb => {
      const date = format(new Date(arb.blockTime), 'yyyy-MM-dd');
      if (!dailyData.has(date)) {
        dailyData.set(date, { mevValue: 0, count: 0 });
      }
      const data = dailyData.get(date)!;
      data.mevValue += arb.mevValue;
      data.count += 1;
    });

    const sortedDates = Array.from(dailyData.keys()).sort();
    const mevValues = sortedDates.map(date => dailyData.get(date)!.mevValue.toFixed(4));
    const counts = sortedDates.map(date => dailyData.get(date)!.count);

    return {
      title: {
        text: 'MEV 价值时间趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['每日 MEV 价值 (ETH)', '交易数量'],
        top: 40,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: sortedDates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'MEV 价值 (ETH)',
          position: 'left',
        },
        {
          type: 'value',
          name: '交易数量',
          position: 'right',
        },
      ],
      series: [
        {
          name: '每日 MEV 价值 (ETH)',
          type: 'line',
          data: mevValues,
          smooth: true,
          itemStyle: {
            color: '#4caf50',
          },
          areaStyle: {
            color: 'rgba(76, 175, 80, 0.3)',
          },
        },
        {
          name: '交易数量',
          type: 'bar',
          yAxisIndex: 1,
          data: counts,
          itemStyle: {
            color: '#2196f3',
          },
        },
      ],
    };
  };

  // 2. 交易量时间趋势图
  const getVolumeTimelineChartOption = () => {
    if (arbitrages.length === 0) return {};

    const dailyData = new Map<string, number>();
    
    arbitrages.forEach(arb => {
      const date = format(new Date(arb.blockTime), 'yyyy-MM-dd');
      if (!dailyData.has(date)) {
        dailyData.set(date, 0);
      }
      dailyData.set(date, dailyData.get(date)! + arb.volume);
    });

    const sortedDates = Array.from(dailyData.keys()).sort();
    const volumes = sortedDates.map(date => (dailyData.get(date)! / 1000).toFixed(2)); // 转换为 K USD

    return {
      title: {
        text: '每日交易量趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${params[0].name}<br/>交易量: $${(parseFloat(params[0].value) * 1000).toLocaleString()} USD`;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedDates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '交易量 (K USD)',
      },
      series: [
        {
          name: '交易量',
          type: 'line',
          data: volumes,
          smooth: true,
          itemStyle: {
            color: '#ff9800',
          },
          areaStyle: {
            color: 'rgba(255, 152, 0, 0.3)',
          },
        },
      ],
    };
  };

  // 3. Top 套利者柱状图
  const getTopSearchersChartOption = () => {
    if (!statistics || statistics.topSearchers.length === 0) return {};

    const addresses = statistics.topSearchers.map(s => 
      `${s.address.slice(0, 6)}...${s.address.slice(-4)}`
    );
    const mevValues = statistics.topSearchers.map(s => s.totalMevValue.toFixed(4));
    const counts = statistics.topSearchers.map(s => s.count);

    return {
      title: {
        text: 'Top 套利者 MEV 价值分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const searcher = statistics.topSearchers[index];
          return `${searcher.name}<br/>地址: ${searcher.address}<br/>MEV 价值: ${params[0].value} ETH<br/>交易数量: ${params[1].value}`;
        },
      },
      legend: {
        data: ['MEV 价值 (ETH)', '交易数量'],
        top: 40,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: addresses,
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'MEV 价值 (ETH)',
          position: 'left',
        },
        {
          type: 'value',
          name: '交易数量',
          position: 'right',
        },
      ],
      series: [
        {
          name: 'MEV 价值 (ETH)',
          type: 'bar',
          data: mevValues,
          itemStyle: {
            color: '#4caf50',
          },
        },
        {
          name: '交易数量',
          type: 'bar',
          yAxisIndex: 1,
          data: counts,
          itemStyle: {
            color: '#2196f3',
          },
        },
      ],
    };
  };

  // 4. Gas 费用分析
  const getGasAnalysisChartOption = () => {
    if (arbitrages.length === 0) return {};

    const dailyData = new Map<string, { baseFees: number; priorityFees: number; mevValue: number }>();
    
    arbitrages.forEach(arb => {
      const date = format(new Date(arb.blockTime), 'yyyy-MM-dd');
      if (!dailyData.has(date)) {
        dailyData.set(date, { baseFees: 0, priorityFees: 0, mevValue: 0 });
      }
      const data = dailyData.get(date)!;
      data.baseFees += arb.baseFees;
      data.priorityFees += arb.priorityFees;
      data.mevValue += arb.mevValue;
    });

    const sortedDates = Array.from(dailyData.keys()).sort();
    const baseFees = sortedDates.map(date => dailyData.get(date)!.baseFees.toFixed(4));
    const priorityFees = sortedDates.map(date => dailyData.get(date)!.priorityFees.toFixed(4));
    const mevValues = sortedDates.map(date => dailyData.get(date)!.mevValue.toFixed(4));

    return {
      title: {
        text: 'Gas 费用 vs MEV 价值分析',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['Base Fees (ETH)', 'Priority Fees (ETH)', 'MEV 价值 (ETH)'],
        top: 40,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedDates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'ETH',
      },
      series: [
        {
          name: 'Base Fees (ETH)',
          type: 'bar',
          stack: 'Gas',
          data: baseFees,
          itemStyle: {
            color: '#f44336',
          },
        },
        {
          name: 'Priority Fees (ETH)',
          type: 'bar',
          stack: 'Gas',
          data: priorityFees,
          itemStyle: {
            color: '#ff9800',
          },
        },
        {
          name: 'MEV 价值 (ETH)',
          type: 'line',
          data: mevValues,
          smooth: true,
          itemStyle: {
            color: '#4caf50',
          },
        },
      ],
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          CEX-DEX 套利行为识别
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>分析目标：</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Uniswap V3 池地址: 0x11b815efB8f581194ae79006d24E0d814B7697F6 (USDT/ETH)</li>
            <li>分析时间段: 2025年9月1日 - 9月30日</li>
          </ul>
        </Alert>
      </Box>

      {/* 操作区域 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={forceRefresh}
                    onChange={(e) => setForceRefresh(e.target.checked)}
                  />
                }
                label="强制刷新已存在数据"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={fetching ? <CircularProgress size={20} /> : <RefreshIcon />}
                  onClick={fetchData}
                  disabled={fetching}
                >
                  {fetching ? '获取中...' : '获取最新数据'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    loadArbitrages();
                    loadStatistics();
                  }}
                  disabled={loading}
                >
                  刷新列表
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 统计信息卡片 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">总交易数</Typography>
                </Box>
                <Typography variant="h4">
                  {statistics.totalTransactions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">总 MEV 价值</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {statistics.totalMevValueETH.toLocaleString(undefined, {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })} ETH
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">总交易量</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  ${statistics.totalVolumeUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">套利者数量</Typography>
                </Box>
                <Typography variant="h4">
                  {statistics.uniqueSearchers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Top 套利者 */}
      {statistics && statistics.topSearchers.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 套利者排行
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>排名</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>地址</TableCell>
                    <TableCell align="right">交易数</TableCell>
                    <TableCell align="right">总 MEV 价值 (ETH)</TableCell>
                    <TableCell align="right">总交易量 (USD)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.topSearchers.map((searcher, index) => (
                    <TableRow key={searcher.address}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small"
                          color={index < 3 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <strong>{searcher.name}</strong>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`https://etherscan.io/address/${searcher.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {searcher.address.slice(0, 10)}...{searcher.address.slice(-8)}
                        </Link>
                      </TableCell>
                      <TableCell align="right">
                        {searcher.count.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {searcher.totalMevValue.toLocaleString(undefined, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })} ETH
                      </TableCell>
                      <TableCell align="right">
                        ${searcher.totalVolume.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 数据分析图表 */}
      {arbitrages.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 2 }}>
            <Typography variant="h5">
              📊 数据分析图表
            </Typography>
            <Chip 
              label={`基于全部 ${arbitrages.length} 条数据`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* MEV 价值时间趋势 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 2 }}>
                <ReactECharts
                  option={getMevTimelineChartOption()}
                  style={{ height: '400px' }}
                />
              </Paper>
            </Grid>

            {/* 交易量时间趋势 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 2 }}>
                <ReactECharts
                  option={getVolumeTimelineChartOption()}
                  style={{ height: '400px' }}
                />
              </Paper>
            </Grid>

            {/* Top 套利者柱状图 */}
            {statistics && statistics.topSearchers.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <ReactECharts
                    option={getTopSearchersChartOption()}
                    style={{ height: '400px' }}
                  />
                </Paper>
              </Grid>
            )}

            {/* Gas 费用分析 */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <ReactECharts
                  option={getGasAnalysisChartOption()}
                  style={{ height: '400px' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* 套利交易列表 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              套利交易列表 (显示 {Math.min(limit, arbitrages.length)} / 总共 {arbitrages.length} 条)
            </Typography>
            <TextField
              type="number"
              label="显示数量"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : arbitrages.length === 0 ? (
            <Alert severity="info">
              暂无数据，请点击"获取最新数据"按钮从 data/data1-4.csv 文件加载数据
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>交易哈希</TableCell>
                    <TableCell>区块</TableCell>
                    <TableCell>时间</TableCell>
                    <TableCell>MEV Bot</TableCell>
                    <TableCell>交易对</TableCell>
                    <TableCell align="right">MEV 价值 (ETH)</TableCell>
                    <TableCell align="right">交易量 (USD)</TableCell>
                    <TableCell align="right">Gas费 (ETH)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arbitrages.slice(0, limit).map((arb) => (
                    <TableRow key={arb.id} hover>
                      <TableCell>
                        <Link
                          href={`https://etherscan.io/tx/${arb.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {arb.txHash.slice(0, 10)}...
                        </Link>
                      </TableCell>
                      <TableCell>{arb.blockNumber.toLocaleString()}</TableCell>
                      <TableCell>
                        {format(new Date(arb.blockTime), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={arb.mevBotLabel || '未知'} 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {arb.pair}
                      </TableCell>
                      <TableCell align="right">
                        {arb.mevValue.toFixed(6)} ETH
                      </TableCell>
                      <TableCell align="right">
                        ${arb.volume.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(arb.baseFees + arb.priorityFees).toFixed(6)} ETH
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

