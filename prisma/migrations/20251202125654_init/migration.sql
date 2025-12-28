-- CreateTable
CREATE TABLE "UniswapTrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "token0Amount" REAL NOT NULL,
    "token1Amount" REAL NOT NULL,
    "priceUSDT" REAL NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BinanceTrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "isBuyerMaker" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArbitrageOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL,
    "uniswapPrice" REAL NOT NULL,
    "binancePrice" REAL NOT NULL,
    "priceDifference" REAL NOT NULL,
    "priceDifferencePercent" REAL NOT NULL,
    "potentialProfitUSDT" REAL NOT NULL,
    "tradeAmount" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UniswapTrade_transactionHash_key" ON "UniswapTrade"("transactionHash");

-- CreateIndex
CREATE INDEX "UniswapTrade_timestamp_idx" ON "UniswapTrade"("timestamp");

-- CreateIndex
CREATE INDEX "UniswapTrade_poolAddress_idx" ON "UniswapTrade"("poolAddress");

-- CreateIndex
CREATE UNIQUE INDEX "BinanceTrade_tradeId_key" ON "BinanceTrade"("tradeId");

-- CreateIndex
CREATE INDEX "BinanceTrade_timestamp_idx" ON "BinanceTrade"("timestamp");

-- CreateIndex
CREATE INDEX "BinanceTrade_symbol_idx" ON "BinanceTrade"("symbol");

-- CreateIndex
CREATE INDEX "ArbitrageOpportunity_timestamp_idx" ON "ArbitrageOpportunity"("timestamp");
