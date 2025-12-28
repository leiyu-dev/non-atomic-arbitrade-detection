# 非原子套利分析系统

这是一个用于检测和分析 Uniswap V3 与 Binance/CEX 之间非原子套利的 Web 应用程序。

## 功能特性

### 1. 价格对比分析
- 展示 Uniswap V3 (USDT/ETH) 与 Binance (ETHUSDT) 的历史成交数据
- 可视化价格变化趋势对比
- 提供详细的统计信息

### 2. 套利机会检测
- 自动识别非原子套利机会
- 计算潜在利润（以 USDT 为单位）
- 分析套利方向和价格差异分布
- 提供详细的套利机会列表

### 3. CEX-DEX 套利行为识别（新增）
基于学术论文 [Measuring CEX-DEX Extracted Value and Searcher Profitability](https://arxiv.org/abs/2507.13023) 的方法：
- 从本地 CSV 文件读取真实链上套利行为数据（test/data.csv）
- 分析 Uniswap V3 USDT/ETH 池 (0x11b815efB8f581194ae79006d24E0d814B7697F6)
- 展示 2025年9月1日至9月30日期间的 26 条套利交易
- 识别 Top 套利者及其 MEV 提取价值
- 提供详细的交易列表和统计分析

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **UI 组件库**: Material-UI (MUI)
- **图表库**: ECharts
- **数据库**: SQLite (通过 Prisma ORM)
- **HTTP 客户端**: Axios
- **数据源**: Dune Analytics API
- **区块链数据**: Ethereum 链上交易数据

## 分析目标

- **时间段**: 2025年9月1日 - 9月30日
- **Uniswap V3 池**: 0x11b815efB8f581194ae79006d24E0d814B7697F6 (USDT/ETH)
- **Binance 交易对**: ETH USDT

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

在 `.env` 文件中配置以下内容：

```env
# 数据库配置
DATABASE_URL="file:./dev.db"
```

**注意：** CEX-DEX 套利行为识别模块已修改为从本地 CSV 文件读取数据，无需配置 Dune API Key。

### 3. 设置数据库

```bash
# Windows PowerShell
$env:DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma migrate dev --name init

# 或者 Linux/Mac
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
# Windows PowerShell
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 使用指南

### 1. 获取交易数据

访问"价格对比"页面，点击"重新获取数据"按钮。系统会生成模拟交易数据并存储到数据库中。

> 注意：当前版本使用模拟数据。如需使用真实数据，请配置相应的 API Keys 并修改数据获取逻辑。

### 2. 查看价格对比

在"价格对比"页面可以：
- 查看 Uniswap V3 和 Binance 的价格走势图
- 查看统计信息（平均价格、最高/最低价格等）
- 分析价格差异

### 3. 检测套利机会

在"套利机会检测"页面：
1. 设置检测参数：
   - 最小利润百分比
   - 交易金额（ETH）
   - 交易手续费百分比
   - 滑点百分比
2. 点击"开始检测"按钮
3. 查看检测结果和统计信息

### 4. CEX-DEX 套利行为识别

在"CEX-DEX套利行为识别"页面：
1. 点击"获取最新数据"按钮从本地 CSV 文件（test/data.csv）加载数据
2. 查看统计信息：
   - 总交易数（26 条真实链上交易）
   - 总 MEV 提取价值（以 ETH 计价）
   - 总交易量（以 USD 计价）
   - 套利者数量
3. 查看 Top 套利者排行
4. 浏览详细的套利交易列表
5. 点击交易哈希可跳转到 Etherscan 查看链上详情

### 5. 分析结果

系统会展示：
- 套利机会总数
- 总潜在利润
- 平均单次利润
- 套利方向分布
- 详细的套利机会列表
- 真实链上套利行为及收益数据

## 套利检测算法

系统使用以下方法检测套利机会：

1. **时间窗口匹配**: 使用1分钟时间窗口匹配 Uniswap 和 Binance 的交易
2. **价格差异计算**: 计算两个交易所之间的价格差异
3. **利润计算**: 考虑交易手续费和滑点，计算净利润
4. **阈值过滤**: 只保留超过最小利润阈值的机会

利润计算公式：
```
净利润 = (卖出价 - 买入价) × 交易金额 - 手续费
手续费 = (买入价 + 卖出价) × 交易金额 × 手续费率
```

## 数据库模型

### UniswapTrade
存储 Uniswap V3 的交易数据

### BinanceTrade
存储 Binance 的交易数据

### ArbitrageOpportunity
存储检测到的套利机会

## API 端点

### 套利机会检测相关
- `POST /api/data/fetch` - 获取并存储交易数据
- `GET /api/data/trades` - 获取交易数据
- `POST /api/arbitrage/detect` - 检测套利机会
- `GET /api/arbitrage/statistics` - 获取套利统计信息

### CEX-DEX 套利行为识别相关
- `POST /api/cexdex/fetch` - 从 Dune Analytics 获取套利行为数据
- `GET /api/cexdex/list` - 获取套利行为列表
- `GET /api/cexdex/statistics` - 获取套利行为统计信息
- `GET /api/cexdex/searcher/[address]` - 获取指定套利者的详细信息

## 项目结构

```
.
├── prisma/                 # Prisma 配置和迁移
│   ├── schema.prisma      # 数据库模型定义
│   └── migrations/        # 数据库迁移文件
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API 路由
│   │   │   ├── arbitrage/    # 套利机会检测 API
│   │   │   ├── cexdex/       # CEX-DEX 套利行为识别 API
│   │   │   └── data/         # 数据获取 API
│   │   ├── components/   # React 组件
│   │   ├── price-comparison/  # 价格对比页面
│   │   ├── arbitrage-analysis/ # 套利机会检测页面
│   │   ├── cexdex-analysis/   # CEX-DEX套利行为识别页面
│   │   └── page.tsx      # 主页
│   └── lib/              # 工具和服务
│       ├── prisma.ts     # Prisma 客户端
│       └── services/     # 业务逻辑
│           ├── binance.ts    # Binance 数据服务
│           ├── uniswap.ts    # Uniswap 数据服务
│           ├── arbitrage.ts  # 套利机会检测服务
│           ├── dune.ts       # Dune Analytics 集成
│           └── cexdex-arbitrage.ts  # CEX-DEX 套利行为识别服务
├── package.json
└── README.md
```

## 数据说明

### 套利机会检测模块
- 当前使用模拟数据进行演示
- 如需使用真实数据，请配置相应的 API Keys

### CEX-DEX 套利行为识别模块
- 使用 Dune Analytics 提供的真实链上数据
- 数据来源：Query ID 6294574
- 分析对象：Uniswap V3 池 0x11b815efB8f581194ae79006d24E0d814B7697F6
- 时间范围：2025年9月1日 - 9月30日
- 基于论文研究方法识别真实的套利行为

## 学术参考

本项目的 CEX-DEX 套利行为识别模块基于以下学术论文：

**Measuring CEX-DEX Extracted Value and Searcher Profitability: The Darkest of the MEV Dark Forest**
- 作者：Fei Wu, Danning Sui, Thomas Thiery, Mallesh Pai
- arXiv: 2507.13023v3
- 发布时间：2025年8月

论文研究了以太坊上中心化交易所（CEX）和去中心化交易所（DEX）之间的套利行为，提供了识别和量化此类套利的方法论。

## 注意事项

1. **API Key**: 使用 CEX-DEX 套利行为识别功能需要配置 Dune Analytics API Key
2. **数据源**: 套利机会检测使用模拟数据，CEX-DEX 套利行为识别使用真实链上数据
3. **性能**: 大量数据可能影响性能，建议适当调整时间范围和显示数量
4. **精度**: 检测结果仅供学习和研究参考，不构成投资建议

## 许可证

MIT
