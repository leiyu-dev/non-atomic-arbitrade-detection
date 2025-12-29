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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { format } from 'date-fns';

interface TradeData {
  uniswapTrades: any[];
  binanceTrades: any[];
}

export default function PriceComparisonPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDate = '2025-09-01';
  const endDate = '2025-09-30';

  // 获取交易数据
  const fetchTradeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/data/trades?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const data = await response.json();
      setTradeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 获取并存储新数据
  const fetchNewData = async () => {
    try {
      setFetchingData(true);
      setError(null);

      const response = await fetch('/api/data/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const result = await response.json();
      
      if (result.success) {
        // 重新加载交易数据
        await fetchTradeData();
      } else {
        throw new Error(result.error || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchTradeData();
  }, []);

  // 准备图表数据
  const getPriceComparisonChartOption = () => {
    if (!tradeData) return {};

    // 聚合数据：每小时一个数据点
    const uniswapPriceMap = new Map<string, number[]>();
    const binancePriceMap = new Map<string, number[]>();

    tradeData.uniswapTrades.forEach(trade => {
      const hour = format(new Date(trade.timestamp), 'yyyy-MM-dd HH:00');
      if (!uniswapPriceMap.has(hour)) {
        uniswapPriceMap.set(hour, []);
      }
      uniswapPriceMap.get(hour)!.push(trade.priceUSDT);
    });

    tradeData.binanceTrades.forEach(trade => {
      const hour = format(new Date(trade.timestamp), 'yyyy-MM-dd HH:00');
      if (!binancePriceMap.has(hour)) {
        binancePriceMap.set(hour, []);
      }
      binancePriceMap.get(hour)!.push(trade.price);
    });

    // 计算平均价格
    const allHours = Array.from(
      new Set([...uniswapPriceMap.keys(), ...binancePriceMap.keys()])
    ).sort();

    const uniswapData = allHours.map(hour => {
      const prices = uniswapPriceMap.get(hour) || [];
      const avg = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : null;
      return [hour, avg];
    });

    const binanceData = allHours.map(hour => {
      const prices = binancePriceMap.get(hour) || [];
      const avg = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : null;
      return [hour, avg];
    });

    return {
      title: {
        text: 'Uniswap V3 vs Binance ETH/USDT 价格对比',
        left: 'center',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          const result = [];
          const date = new Date(params[0].axisValue);
          result.push(`<div style="padding: 4px 0;"><b>${format(date, 'yyyy-MM-dd HH:mm')}</b></div>`);
          params.forEach((param: any) => {
            if (param.value[1] !== null) {
              const color = param.color;
              result.push(`<div style="display: flex; align-items: center; margin: 2px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 6px;"></span>
                <span>${param.seriesName}: </span>
                <span style="color: ${color}; font-weight: bold;">${param.value[1].toFixed(2)}</span>
              </div>`);
            }
          });
          return result.join('');
        },
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
        padding: 12,
      },
      legend: {
        data: ['Uniswap V3', 'Binance'],
        top: 40,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 13,
          fontWeight: '500',
        },
        itemWidth: 18,
        itemHeight: 18,
        itemGap: 20,
        borderRadius: 4,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          show: false, // 默认隐藏 x 轴标签
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
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
        name: '价格 (USDT)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          formatter: '${value}',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 11,
          fontWeight: '500',
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
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
          name: 'Uniswap V3',
          type: 'line',
          data: uniswapData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          sampling: 'lttb',
          lineStyle: {
            color: '#2196F3',
            width: 3,
            shadowColor: 'rgba(33, 150, 243, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 3,
          },
          itemStyle: {
            color: '#2196F3',
            borderColor: '#FFFFFF',
            borderWidth: 2,
            shadowColor: 'rgba(33, 150, 243, 0.8)',
            shadowBlur: 8,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
                { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
              ]
            },
          },
          emphasis: {
            lineStyle: {
              width: 5,
            },
            itemStyle: {
              symbolSize: 12,
              shadowBlur: 15,
            },
          },
          animation: true,
          animationDuration: 2000,
          animationEasing: 'cubicOut',
        },
        {
          name: 'Binance',
          type: 'line',
          data: binanceData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          sampling: 'lttb',
          lineStyle: {
            color: '#F0B90B',
            width: 3,
            shadowColor: 'rgba(240, 185, 11, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 3,
          },
          itemStyle: {
            color: '#F0B90B',
            borderColor: '#FFFFFF',
            borderWidth: 2,
            shadowColor: 'rgba(240, 185, 11, 0.8)',
            shadowBlur: 8,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(240, 185, 11, 0.3)' },
                { offset: 1, color: 'rgba(240, 185, 11, 0.05)' }
              ]
            },
          },
          emphasis: {
            lineStyle: {
              width: 5,
            },
            itemStyle: {
              symbolSize: 12,
              shadowBlur: 15,
            },
          },
          animation: true,
          animationDuration: 2000,
          animationEasing: 'cubicOut',
          animationDelay: 300,
        },
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          fillerColor: 'rgba(255, 255, 255, 0.15)',
          textStyle: {
            color: '#FFFFFF',
            fontSize: 11,
          },
          handleStyle: {
            color: '#FFFFFF',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          start: 0,
          end: 100,
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

  // 计算统计信息
  const getStatistics = () => {
    if (!tradeData) return null;

    const uniswapPrices = tradeData.uniswapTrades.map(t => t.priceUSDT);
    const binancePrices = tradeData.binanceTrades.map(t => t.price);

    const avgUniswap =
      uniswapPrices.reduce((a, b) => a + b, 0) / uniswapPrices.length;
    const avgBinance =
      binancePrices.reduce((a, b) => a + b, 0) / binancePrices.length;

    const maxUniswap = Math.max(...uniswapPrices);
    const minUniswap = Math.min(...uniswapPrices);
    const maxBinance = Math.max(...binancePrices);
    const minBinance = Math.min(...binancePrices);

    return {
      uniswap: {
        avg: avgUniswap,
        max: maxUniswap,
        min: minUniswap,
        count: uniswapPrices.length,
      },
      binance: {
        avg: avgBinance,
        max: maxBinance,
        min: minBinance,
        count: binancePrices.length,
      },
      priceDiff: Math.abs(avgUniswap - avgBinance),
      priceDiffPercent: (Math.abs(avgUniswap - avgBinance) / avgBinance) * 100,
    };
  };

  const statistics = getStatistics();

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        价格对比分析
      </Typography>

      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        分析时间段：2025年9月1日 - 9月30日
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={fetchTradeData}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : '刷新数据'}
        </Button>
        <Button
          variant="outlined"
          onClick={fetchNewData}
          disabled={fetchingData}
        >
          {fetchingData ? <CircularProgress size={24} /> : '从本地重新获取数据'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 统计信息卡片 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Uniswap V3 统计
                </Typography>
                <Typography variant="body1">
                  平均价格: ${statistics.uniswap.avg.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  最高价格: ${statistics.uniswap.max.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  最低价格: ${statistics.uniswap.min.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  交易数量: {statistics.uniswap.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Binance 统计
                </Typography>
                <Typography variant="body1">
                  平均价格: ${statistics.binance.avg.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  最高价格: ${statistics.binance.max.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  最低价格: ${statistics.binance.min.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  交易数量: {statistics.binance.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
              },
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  价格差异
                </Typography>
                <Typography variant="body1">
                  平均价差: ${statistics.priceDiff.toFixed(2)} (
                  {statistics.priceDiffPercent.toFixed(2)}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 图表 */}
      {tradeData && (
        <Paper sx={{ 
          p: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
          },
        }}>
          <ReactECharts
            option={getPriceComparisonChartOption()}
            style={{ height: '500px' }}
          />
        </Paper>
      )}

      {!tradeData && !loading && (
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
            暂无数据，请点击"重新获取数据"按钮
          </Typography>
        </Paper>
      )}
    </Container>
  );
}