'use client';``
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* 标题部分 */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          非原子套利检测系统
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Uniswap V3 与 Binance 之间的套利机会分析
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          分析时间段：2025年9月1日 - 9月30日
        </Typography>
      </Box>

      {/* 功能介绍卡片 */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareArrowsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  价格对比分析
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                实时展示 Uniswap V3 (USDT/ETH) 与 Binance (ETHUSDT) 的历史成交数据，
                并通过可视化图表对比两者的价格变化趋势。
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 历史交易数据展示" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 价格走势可视化对比" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 统计信息与价格差异分析" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="contained"
                component={Link}
                href="/price-comparison"
                fullWidth
              >
                查看价格对比
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  套利机会检测
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                通过启发式规则和统计分析方法，识别 Uniswap V3 与 Binance 之间的
                非原子套利机会，并计算潜在利润（USDT）。
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 套利机会自动检测" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 潜在利润计算" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 套利方向与统计分析" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="contained"
                color="success"
                component={Link}
                href="/arbitrage-analysis"
                fullWidth
              >
                查看套利分析
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 技术说明 */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          <AccountBalanceIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          技术说明
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom color="primary">
              数据来源
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Uniswap V3"
                  secondary="池地址：0x11b815efB8f581194ae79006d24E0d814B7697F6"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Binance"
                  secondary="交易对：ETHUSDT"
                />
              </ListItem>
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              检测方法
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="时间窗口匹配"
                  secondary="使用滑动时间窗口匹配交易"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="价格差异分析"
                  secondary="计算考虑手续费和滑点的净利润"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="启发式过滤"
                  secondary="根据最小利润阈值筛选机会"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* 快速开始 */}
      <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          快速开始
        </Typography>
        <Typography variant="body1" paragraph>
          1. 访问"价格对比"页面，点击"重新获取数据"按钮导入交易数据
        </Typography>
        <Typography variant="body1" paragraph>
          2. 查看 Uniswap V3 与 Binance 的价格走势图表
        </Typography>
        <Typography variant="body1" paragraph>
          3. 访问"套利分析"页面，设置检测参数并点击"开始检测"
        </Typography>
        <Typography variant="body1">
          4. 查看检测到的套利机会详情和统计分析
        </Typography>
      </Paper>
    </Container>
  );
}
