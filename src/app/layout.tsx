import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import "./globals.css";

export const metadata: Metadata = {
  title: "非原子套利检测系统 - 专业套利分析平台",
  description: "基于 Uniswap V3 与 Binance 的高级非原子套利检测与分析系统，支持实时机会检测与链上行为识别",
  keywords: "套利, Uniswap, Binance, 加密货币, 交易分析, 区块链",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" > 
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body style={{ position: 'relative', background: 'transparent' }}> {/* body背景透明 */}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* 粒子背景 - 显示在导航栏和内容底下 */}
            <ParticleBackground />
            <Navigation />
            <main style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
              {children}
            </main>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}