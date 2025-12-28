'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FF88', // 科技绿色
      light: '#33FFAA',
      dark: '#00CC66',
      contrastText: '#000000',
    },
    secondary: {
      main: '#00CC66', // 深科技绿色
      light: '#33FF99',
      dark: '#00994C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0A0A', // 纯黑色背景
      paper: '#1A1A1A', // 深灰色卡片背景
    },
    text: {
      primary: '#FFFFFF', // 白色主文字
      secondary: '#B0B0B0', // 浅灰色次要文字
    },
    divider: 'rgba(0, 255, 136, 0.2)', // 绿色分隔线
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontWeight: 500, // 增加字体重量
    },
    body2: {
      fontWeight: 500, // 增加字体重量
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.1)',
          background: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(0, 255, 136, 0.3)',
          background: 'linear-gradient(135deg, #00FF88 0%, #00CC66 100%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #33FFAA 0%, #00FF88 100%)',
            boxShadow: '0 6px 20px rgba(0, 255, 136, 0.4)',
          },
        },
        outlined: {
          borderColor: '#00FF88',
          color: '#00FF88',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderColor: '#33FFAA',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
          fontWeight: 500, // 增加表格字体重量
        },
        head: {
          fontWeight: 600,
          color: '#00FF88',
        },
      },
    },
    // 图表容器样式优化
    MuiPaper: {
      styleOverrides: {
        root: {
          '& .echarts-for-react': {
            backgroundColor: '#2A2A2A !important', // 图表背景色改为浅灰色
            borderRadius: '8px',
            padding: '16px',
          },
        },
      },
    },
  },
});

export default theme;