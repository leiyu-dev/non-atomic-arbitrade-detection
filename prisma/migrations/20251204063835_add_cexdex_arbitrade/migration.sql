-- CreateTable
CREATE TABLE "CexDexArbitrage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" DATETIME NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "searcherAddress" TEXT NOT NULL,
    "searcherName" TEXT,
    "token0Symbol" TEXT NOT NULL,
    "token1Symbol" TEXT NOT NULL,
    "token0Address" TEXT NOT NULL,
    "token1Address" TEXT NOT NULL,
    "token0Amount" REAL NOT NULL,
    "token1Amount" REAL NOT NULL,
    "swapPrice" REAL NOT NULL,
    "estimatedRevenueUSD" REAL,
    "estimatedProfitUSD" REAL,
    "gasCostUSD" REAL,
    "duneQueryId" INTEGER,
    "duneDataFetched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CexDexArbitrage_transactionHash_key" ON "CexDexArbitrage"("transactionHash");

-- CreateIndex
CREATE INDEX "CexDexArbitrage_blockTimestamp_idx" ON "CexDexArbitrage"("blockTimestamp");

-- CreateIndex
CREATE INDEX "CexDexArbitrage_searcherAddress_idx" ON "CexDexArbitrage"("searcherAddress");

-- CreateIndex
CREATE INDEX "CexDexArbitrage_poolAddress_idx" ON "CexDexArbitrage"("poolAddress");

-- CreateIndex
CREATE INDEX "CexDexArbitrage_blockNumber_idx" ON "CexDexArbitrage"("blockNumber");
