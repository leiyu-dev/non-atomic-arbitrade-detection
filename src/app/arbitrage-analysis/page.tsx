'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { format } from 'date-fns';

interface ArbitrageStatistics {
  totalOpportunities: number;
  totalPotentialProfit: number;
  averageProfitPerOpportunity: number;
  maxProfit: number;
  minProfit: number;
  buyUniswapCount: number;
  buyBinanceCount: number;
}

interface ArbitrageOpportunity {
  id: string;
  timestamp: string;
  uniswapPrice: number;
  binancePrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  potentialProfitUSDT: number;
  tradeAmount: number;
  direction: string;
}

export default function ArbitrageAnalysisPage() {
  const [loading, setLoading] = useState(false);
const [detecting, setDetecting] = useState(false);
  const [statistics, setStatistics] = useState<ArbitrageStatistics | null>(null);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [error, setError] = useState<string | null>(null);

// 检测参数
  const [params, setParams] = useState({
    tradeAmountETH: 1,
    tradingFeePercent: 0.1,
    slippagePercent: 0.1,
  });

  const startDate = '2025-09-01';
  const endDate = '2025-09-30';

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/arbitrage/statistics?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('获取统计信息失败');
      }

      const data = await response.json();
      setStatistics(data.statistics);
      setOpportunities(data.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 检测套利机会
  const detectArbitrage = async () => {
    try {
      setDetecting(true);
      setError(null);

      const response = await fetch('/api/arbitrage/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error('检测套利机会失败');
      }

      const result = await response.json();

      if (result.success) {
        // 重新加载统计信息
        await fetchStatistics();
      } else {
        throw new Error(result.error || '检测套利机会失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 利润时间分布图表
  const getProfitTimelineChartOption = () => {
    if (opportunities.length === 0) return {};

    const data = opportunities.map(opp => [
      new Date(opp.timestamp).getTime(),
      opp.potentialProfitUSDT,
    ]);

    return {
      title: {
        text: '套利利润时间分布',
        left: 'center',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = format(new Date(params[0].value[0]), 'yyyy-MM-dd HH:mm');
          const profit = params[0].value[1].toFixed(2);
          return `<div style="padding: 8px;"><b>${date}</b><br/>潜在利润: <span style="color: #00FF88;">${profit}</span></div>`;
        },
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#00FF88',
        borderWidth: 1,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
        transition: 'all 0.3s ease',
      },
      xAxis: {
        type: 'time',
        name: '时间',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#00FF88',
          fontSize: 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 10,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 255, 136, 0.5)',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '利润 (USDT)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: '#00FF88',
          fontSize: 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          formatter: '${value}',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 10,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 255, 136, 0.5)',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '潜在利润',
          type: 'scatter',
          data: data,
          symbolSize: 10,
          itemStyle: {
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              { offset: 0, color: '#00FF88' },
              { offset: 1, color: '#00AA66' },
            ]),
            borderColor: '#FFFFFF',
            borderWidth: 2,
            shadowColor: 'rgba(0, 255, 136, 0.8)',
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          emphasis: {
            itemStyle: {
              symbolSize: 18,
              shadowBlur: 20,
              shadowColor: 'rgba(0, 255, 136, 1)',
            },
          },
          animation: true,
          animationDuration: 1500,
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 10,
        },
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(0, 255, 136, 0.5)',
          fillerColor: 'rgba(0, 255, 136, 0.2)',
          textStyle: {
            color: '#FFFFFF',
          },
          handleStyle: {
            color: '#00FF88',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 255, 136, 0.5)',
          },
        },
        {
          type: 'inside',
        },
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
      },
    };
  };

  // 价格差异分布图表
  const getPriceDifferenceChartOption = () => {
    if (opportunities.length === 0) return {};

    // 按价格差异百分比分组
    const bins = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    const counts = new Array(bins.length - 1).fill(0);

    opportunities.forEach(opp => {
      const percent = opp.priceDifferencePercent;
      for (let i = 0; i < bins.length - 1; i++) {
        if (percent >= bins[i] && percent < bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
    });

    const categories = bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}%`);
return {
      title: {
        text: '价格差异分布',
        left: 'center',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0, 162, 255, 0.5)',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowColor: 'rgba(0, 162, 255, 0.3)',
        },
        formatter: (params: any) => {
          const category = params[0].name;
          const count = params[0].value;
          return `<div style="padding: 8px;"><b>${category}</b><br/>机会数量: <span style="color: #00A2FF;">${count}</span></div>`;
        },
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#00A2FF',
        borderWidth: 1,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 162, 255, 0.3)',
      },
      xAxis: {
        type: 'category',
        data: categories,
        name: '价格差异百分比',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#00A2FF',
          fontSize: 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 11,
          fontWeight: '500',
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 162, 255, 0.5)',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '机会数量',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: '#00A2FF',
          fontSize: 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 162, 255, 0.5)',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '机会数量',
          type: 'bar',
          data: counts,
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00A2FF' },
              { offset: 1, color: '#0066CC' },
            ]),
            borderRadius: [8, 8, 0, 0],
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            shadowColor: 'rgba(0, 162, 255, 0.5)',
            shadowBlur: 8,
            shadowOffsetY: 2,
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00D4FF' },
                { offset: 1, color: '#0088FF' },
              ]),
              shadowBlur: 15,
              shadowColor: 'rgba(0, 212, 255, 0.8)',
            },
          },
          animation: true,
          animationDuration: 1200,
          animationEasing: 'bounceOut',
          animationDelay: (idx: number) => idx * 100,
        },
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
      },
    };
  };

  // 套利方向饼图
  const getDirectionPieChartOption = () => {
    if (!statistics) return {};

    return {
      title: {
        text: '套利方向分布',
        left: 'center',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(33, 150, 243, 0.5)',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const name = params.name;
          const value = params.value;
          const percent = params.percent.toFixed(2);
          return `<div style="padding: 8px;"><b>${name}</b><br/>数量: <span style="color: #FF69B4;">${value}</span><br/>占比: <span style="color: #FF69B4;">${percent}%</span></div>`;
        },
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#2196F3',
          borderWidth: 1,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 12,
          fontWeight: '500',
        },
        itemWidth: 16,
        itemHeight: 16,
        itemGap: 12,
        formatter: (name: string) => {
          return name.length > 15 ? name.substring(0, 15) + '...' : name;
        },
      },
      series: [
        {
          name: '套利方向',
          type: 'pie',
          radius: ['35%', '60%'], // 环形图
          center: ['60%', '50%'],
          data: [
            {
              value: statistics.buyUniswapCount,
              name: '买入 Uniswap, 卖出 Binance',
              itemStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: '#2196F3' },
                  { offset: 1, color: '#1565C0' },
                ]),
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            },
            {
              value: statistics.buyBinanceCount,
              name: '买入 Binance, 卖出 Uniswap',
              itemStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: '#4CAF50' },
                  { offset: 1, color: '#2E7D32' },
                ]),
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowColor: 'rgba(255, 255, 255, 0.8)',
              scale: 1.1,
            },
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '500',
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
            length: 20,
            length2: 30,
          },
          animation: true,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
      },
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 , mt: 8}}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          非原子套利分析
        </Typography>
      
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        分析时间段：2025年9月1日 - 9月30日
      </Typography>

      {/* 检测参数 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          检测参数设置
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="交易金额 (ETH)"
              type="number"
              value={isNaN(params.tradeAmountETH) ? '' : params.tradeAmountETH}
              onChange={e => {
                const value = parseFloat(e.target.value);
                setParams({ ...params, tradeAmountETH: isNaN(value) ? 0 : value });
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="交易手续费 ($)"
              type="number"
              value={isNaN(params.tradingFeePercent) ? '' : params.tradingFeePercent}
              onChange={e => {
                const value = parseFloat(e.target.value);
                setParams({ ...params, tradingFeePercent: isNaN(value) ? 0 : value });
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="滑点 (%)"
              type="number"
              value={isNaN(params.slippagePercent) ? '' : params.slippagePercent}
              onChange={e => {
                const value = parseFloat(e.target.value);
                setParams({ ...params, slippagePercent: isNaN(value) ? 0 : value });
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={detectArbitrage}
            disabled={detecting}
          >
            {detecting ? <CircularProgress size={24} /> : '开始检测'}
          </Button>
          <Button variant="outlined" onClick={fetchStatistics} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '刷新统计'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 统计信息 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { title: '套利机会总数', value: statistics.totalOpportunities, color: 'primary' },
            { title: '总潜在利润', value: `$${statistics.totalPotentialProfit.toFixed(2)}`, color: 'success' },
            { title: '平均单次利润', value: `$${statistics.averageProfitPerOpportunity.toFixed(2)}`, color: 'info' },
            { title: '最大单次利润', value: `$${statistics.maxProfit.toFixed(2)}`, color: 'text.secondary' },
            { title: '最小单次利润', value: `$${statistics.minProfit.toFixed(2)}`, color: 'text.secondary' },
            { title: '套利方向分布', value: `买U: ${statistics.buyUniswapCount} 买B: ${statistics.buyBinanceCount}`, color: 'text.secondary' }
          ].map((item, index) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
                },
              }}>
                <CardContent>
                  <Typography variant={index < 3 ? "h6" : "body2"} color={item.color} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant={index < 3 ? "h4" : "h5"}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 图表 */}
      {opportunities.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ 
              p: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <ReactECharts
                option={getProfitTimelineChartOption()}
                style={{ height: '400px' }}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ 
              p: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <ReactECharts
                option={getPriceDifferenceChartOption()}
                style={{ height: '400px' }}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ 
              p: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <ReactECharts
                option={getDirectionPieChartOption()}
                style={{ height: '400px' }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 套利机会列表 */}
      {opportunities.length > 0 && (
        <Paper sx={{ 
          p: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
          },
        }}>
          <Typography variant="h6" gutterBottom>
            套利机会详情
          </Typography>
          <TableContainer sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 20px rgba(0, 255, 136, 0.15)',
            },
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>时间</TableCell>
                  <TableCell align="right">Uniswap 价格</TableCell>
                  <TableCell align="right">Binance 价格</TableCell>
                  <TableCell align="right">价格差异</TableCell>
                  <TableCell align="right">潜在利润</TableCell>
                  <TableCell>套利方向</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {opportunities.slice(0, 50).map(opp => (
                  <TableRow key={opp.id} hover>
                    <TableCell>
                      {format(new Date(opp.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell align="right">
                      ${opp.uniswapPrice.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${opp.binancePrice.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${opp.priceDifference.toFixed(2)} (
                      {opp.priceDifferencePercent.toFixed(2)}%)
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        ${opp.potentialProfitUSDT.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          opp.direction === 'buy_uniswap_sell_binance'
                            ? '买 U / 卖 B'
                            : '买 B / 卖 U'
                        }
                        color={
                          opp.direction === 'buy_uniswap_sell_binance'
                            ? 'primary'
                            : 'secondary'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {opportunities.length > 50 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              显示前 50 条记录，共 {opportunities.length} 条
            </Typography>
          )}
        </Paper>
      )}

      {!statistics && !loading && (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
          },
        }}>
          <Typography variant="h6" color="text.secondary">
            暂无数据，请先点击"开始检测"按钮
          </Typography>
        </Paper>
      )}
    </Container>
  );
}