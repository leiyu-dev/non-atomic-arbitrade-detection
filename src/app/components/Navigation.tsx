'use client';
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  window?: () => Window;
  children: React.ReactElement;
}

function HideOnScroll(props: Props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 鼠标悬停时显示导航栏
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 100) { // 鼠标靠近顶部时显示
        setIsHovered(true);
        setIsVisible(true);
      } else if (e.clientY > 200) { // 鼠标离开顶部区域时隐藏
        setIsHovered(false);
        setTimeout(() => {
          if (!isHovered) setIsVisible(false);
        }, 300);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const navItems = [
    { label: '首页', href: '/' },
    { label: '价格对比', href: '/price-comparison' },
    { label: '套利分析', href: '/arbitrage-analysis' },
    { label: '行为识别', href: '/cexdex-analysis' },
  ];

  return (
    <HideOnScroll>
      <AppBar 
        sx={{ 
          backgroundColor: isVisible ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
          backdropFilter: isVisible ? 'blur(10px)' : 'none',
          borderBottom: isVisible ? '1px solid rgba(0, 255, 136, 0.2)' : 'none', // 改为科技绿色边框
          transition: 'all 0.3s ease',
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTimeout(() => setIsVisible(false), 500);
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: '#00FF88', // 改为科技绿色
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00FF88 0%, #00CC66 100%)', // 改为科技绿色渐变
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            套利分析系统
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                href={item.href}
                sx={{
                  color: isActive(item.href) ? '#00FF88' : '#B0B0B0', // 激活状态改为科技绿色
                  fontWeight: isActive(item.href) ? 600 : 500,
                  position: 'relative',
                  '&:hover': {
                    color: '#00FF88', // 悬停状态改为科技绿色
                    backgroundColor: 'rgba(0, 255, 136, 0.1)', // 悬停背景改为科技绿色
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: isActive(item.href) ? '80%' : '0%',
                    height: '2px',
                    backgroundColor: '#00FF88', // 下划线改为科技绿色
                    transform: 'translateX(-50%)',
                    transition: 'width 0.3s ease',
                  },
                  '&:hover::after': {
                    width: '80%',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}