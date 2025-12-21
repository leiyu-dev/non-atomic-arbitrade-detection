'use client';
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
  Chip,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Home() {
  const features = [
    {
      icon: <CompareArrowsIcon sx={{ fontSize: 40 }} />,
      title: '价格对比分析',
      description: '实时展示 Uniswap V3 与 Binance 的历史成交数据，通过可视化图表对比价格变化趋势。',
      features: ['历史交易数据展示', '价格走势可视化对比', '统计信息与价格差异分析'],
      color: 'primary',
      href: '/price-comparison',
    },
    {
      icon: <BoltIcon sx={{ fontSize: 40 }} />,
      title: '套利机会检测',
      description: '通过启发式规则和统计分析方法，识别 Uniswap V3 与 Binance 之间的非原子套利机会。',
      features: ['套利机会自动检测', '潜在利润计算', '套利方向与统计分析'],
      color: 'secondary',
      href: '/arbitrage-analysis',
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      title: '套利行为识别',
      description: '基于学术论文方法，从 Dune Analytics 获取真实链上数据，由此来分析套利者交易行为。',
      features: ['真实链上套利交易', 'Top 套利者排行', '收益与利润分析'],
      color: 'warning',
      href: '/cexdex-analysis',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
      color: 'white'
    }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0A0A0A 0%, #0F1A15 30%, #1A2A22 70%, #0F1A15 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Chip 
              label="专业套利分析平台" 
              sx={{ 
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                color: '#33FFAA',
                mb: 3,
                fontWeight: 600,
                border: '1px solid rgba(0, 255, 136, 0.4)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
              }} 
            />
            <Typography variant="h1" component="h1" gutterBottom sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #33FFAA 0%, #00FF88 30%, #00CC66 70%, #00994C 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              mb: 2,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '4rem' }, // 增加字体大小
            }}>
              非原子套利分析系统
            </Typography>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 400,
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}>
              Uniswap V3 与 CEX 之间的高级套利分析平台，支持机会检测与真实链上行为识别
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                  fontSize: '1rem',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
                component={Link}
                href="/arbitrage-analysis"
              >
                开始分析
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(0, 255, 136, 0.6)',
                  color: '#33FFAA',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                  fontSize: '1rem',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 136, 0.08)',
                    transform: 'translateY(-2px)',
                    borderColor: '#33FFAA',
                    color: '#33FFAA',
                  },
                  transition: 'all 0.3s ease',
                }}
                component={Link}
                href="/price-comparison"
              >
                查看价格
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Card 
                className="fade-in"
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 255, 136, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)',
                      color: '#00FF88', // 图标颜色改为科技绿色
                      mb: 3,
                      mx: 'auto',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom align="center" fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph align="center">
                    {feature.description}
                  </Typography>
                  <List dense>
                    {feature.features.map((item) => (
                      <ListItem key={item} sx={{ px: 0 }}>
                        <Box 
                          component="span" 
                          sx={{ 
                            color: '#00FF88', // 列表项圆点改为科技绿色
                            mr: 1.5,
                            fontWeight: 600,
                          }}
                        >
                          •
                        </Box>
                        <ListItemText 
                          primary={item} 
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color={feature.color as any}
                    component={Link}
                    href={feature.href}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    开始使用
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tech Specs Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper 
          sx={{ 
            p: 6,
            border: '1px solid rgba(0, 255, 136, 0.1)',
            background: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)',
                color: '#00FF88', // 图标颜色改为科技绿色
                mb: 2,
                border: '1px solid rgba(0, 255, 136, 0.3)',
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
              技术规格
            </Typography>
            <Typography variant="body1" color="text.secondary">
              基于先进的数据分析和机器学习技术
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#00FF88' }} fontWeight={600}>
                📊 数据来源
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="Uniswap V3"
                    secondary="池地址：0x11b815efB8f581194ae79006d24E0d814B7697F6"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="Binance"
                    secondary="交易对：ETHUSDT，实时市场数据"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="Dune Analytics"
                    secondary="链上交易数据分析与可视化"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#00FF88' }} fontWeight={600}>
                ⚡ 技术特性
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="实时数据处理"
                    secondary="毫秒级数据更新与处理能力"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="智能算法检测"
                    secondary="基于机器学习的套利机会识别"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Box component="span" sx={{ color: '#00FF88', mr: 2, fontWeight: 600 }}>•</Box>
                  <ListItemText
                    primary="可视化分析"
                    secondary="交互式图表与数据可视化"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}