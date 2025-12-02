'use client';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          非原子套利检测
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            href="/"
            sx={{
              fontWeight: pathname === '/' ? 'bold' : 'normal',
              textDecoration: pathname === '/' ? 'underline' : 'none',
            }}
          >
            首页
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/price-comparison"
            sx={{
              fontWeight: pathname === '/price-comparison' ? 'bold' : 'normal',
              textDecoration: pathname === '/price-comparison' ? 'underline' : 'none',
            }}
          >
            价格对比
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/arbitrage-analysis"
            sx={{
              fontWeight: pathname === '/arbitrage-analysis' ? 'bold' : 'normal',
              textDecoration: pathname === '/arbitrage-analysis' ? 'underline' : 'none',
            }}
          >
            套利分析
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

