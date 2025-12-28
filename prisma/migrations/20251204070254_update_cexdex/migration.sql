/*
  Warnings:

  - You are about to drop the column `blockTimestamp` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedProfitUSD` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedRevenueUSD` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `gasCostUSD` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `poolAddress` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `searcherAddress` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `searcherName` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `swapPrice` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token0Address` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token0Amount` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token0Symbol` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token1Address` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token1Amount` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `token1Symbol` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `CexDexArbitrage` table. All the data in the column will be lost.
  - Added the required column `baseFees` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockTime` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cbTransfer` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromAddr` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mevValue` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multiTrade` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pair` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priorityFees` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taker` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAddr` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenBoughtAmount` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenBoughtContract` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenBoughtSymbol` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenSoldAmount` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenSoldContract` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenSoldSymbol` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txHash` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txIndex` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `CexDexArbitrage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CexDexArbitrage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTime" DATETIME NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "fromAddr" TEXT NOT NULL,
    "toAddr" TEXT NOT NULL,
    "taker" TEXT NOT NULL,
    "mevBotLabel" TEXT,
    "baseFees" REAL NOT NULL,
    "priorityFees" REAL NOT NULL,
    "cbTransfer" REAL NOT NULL,
    "mevValue" REAL NOT NULL,
    "volume" REAL NOT NULL,
    "tokenBoughtSymbol" TEXT NOT NULL,
    "tokenSoldSymbol" TEXT NOT NULL,
    "tokenBoughtContract" TEXT NOT NULL,
    "tokenSoldContract" TEXT NOT NULL,
    "tokenBoughtAmount" REAL NOT NULL,
    "tokenSoldAmount" REAL NOT NULL,
    "pair" TEXT NOT NULL,
    "multiTrade" INTEGER NOT NULL,
    "duneQueryId" INTEGER,
    "duneDataFetched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CexDexArbitrage" ("blockNumber", "createdAt", "duneDataFetched", "duneQueryId", "id", "updatedAt") SELECT "blockNumber", "createdAt", "duneDataFetched", "duneQueryId", "id", "updatedAt" FROM "CexDexArbitrage";
DROP TABLE "CexDexArbitrage";
ALTER TABLE "new_CexDexArbitrage" RENAME TO "CexDexArbitrage";
CREATE UNIQUE INDEX "CexDexArbitrage_txHash_key" ON "CexDexArbitrage"("txHash");
CREATE INDEX "CexDexArbitrage_blockTime_idx" ON "CexDexArbitrage"("blockTime");
CREATE INDEX "CexDexArbitrage_fromAddr_idx" ON "CexDexArbitrage"("fromAddr");
CREATE INDEX "CexDexArbitrage_taker_idx" ON "CexDexArbitrage"("taker");
CREATE INDEX "CexDexArbitrage_blockNumber_idx" ON "CexDexArbitrage"("blockNumber");
CREATE INDEX "CexDexArbitrage_pair_idx" ON "CexDexArbitrage"("pair");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
