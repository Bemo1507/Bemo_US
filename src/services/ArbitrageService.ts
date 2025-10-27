import BigNumber from 'bignumber.js';
import { PriceQuote } from './PriceService';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ArbitrageOpportunity {
  tokenIn: string;
  tokenOut: string;
  buyDex: string;
  sellDex: string;
  buyPrice: string;
  sellPrice: string;
  amountIn: string;
  expectedAmountOut: string;
  profitAmount: string;
  profitPercentage: string;
  estimatedGasCost: string;
  netProfit: string;
  netProfitPercentage: string;
  timestamp: number;
}

export class ArbitrageService {
  private readonly minProfitPercentage: number;

  constructor() {
    this.minProfitPercentage = config.minProfitPercentage;
  }

  findArbitrageOpportunities(
    prices: PriceQuote[],
    estimatedGasCostBNB: string = '0.001'
  ): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    // Group prices by token pair
    const pairMap = new Map<string, PriceQuote[]>();
    
    for (const price of prices) {
      const pairKey = `${price.tokenIn}-${price.tokenOut}`;
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, []);
      }
      pairMap.get(pairKey)!.push(price);
    }

    // Find arbitrage opportunities for each pair
    for (const [pairKey, pairPrices] of pairMap.entries()) {
      if (pairPrices.length < 2) continue;

      // Sort by price (ascending for buy, descending for sell)
      const sortedPrices = [...pairPrices].sort((a, b) => 
        new BigNumber(b.price).comparedTo(new BigNumber(a.price))
      );

      // Check all combinations
      for (let i = 0; i < sortedPrices.length; i++) {
        for (let j = i + 1; j < sortedPrices.length; j++) {
          const sellQuote = sortedPrices[i]; // Higher price (sell here)
          const buyQuote = sortedPrices[j];  // Lower price (buy here)

          const opportunity = this.calculateArbitrage(
            buyQuote,
            sellQuote,
            estimatedGasCostBNB
          );

          if (opportunity && new BigNumber(opportunity.netProfitPercentage).isGreaterThan(this.minProfitPercentage)) {
            opportunities.push(opportunity);
          }
        }
      }
    }

    // Sort by net profit percentage (descending)
    return opportunities.sort((a, b) => 
      new BigNumber(b.netProfitPercentage).comparedTo(new BigNumber(a.netProfitPercentage))
    );
  }

  private calculateArbitrage(
    buyQuote: PriceQuote,
    sellQuote: PriceQuote,
    estimatedGasCostBNB: string
  ): ArbitrageOpportunity | null {
    try {
      const buyPrice = new BigNumber(buyQuote.price);
      const sellPrice = new BigNumber(sellQuote.price);

      // Price difference check
      if (sellPrice.isLessThanOrEqualTo(buyPrice)) {
        return null;
      }

      const amountIn = new BigNumber(buyQuote.amountIn);
      const expectedAmountOut = new BigNumber(sellQuote.amountOut);
      
      // Calculate profit
      const profitAmount = expectedAmountOut.minus(amountIn);
      const profitPercentage = profitAmount.dividedBy(amountIn).multipliedBy(100);

      // Subtract gas cost
      const gasCost = new BigNumber(estimatedGasCostBNB);
      const netProfit = profitAmount.minus(gasCost);
      const netProfitPercentage = netProfit.dividedBy(amountIn).multipliedBy(100);

      return {
        tokenIn: buyQuote.tokenIn,
        tokenOut: buyQuote.tokenOut,
        buyDex: buyQuote.dex,
        sellDex: sellQuote.dex,
        buyPrice: buyPrice.toString(),
        sellPrice: sellPrice.toString(),
        amountIn: amountIn.toString(),
        expectedAmountOut: expectedAmountOut.toString(),
        profitAmount: profitAmount.toString(),
        profitPercentage: profitPercentage.toFixed(4),
        estimatedGasCost: gasCost.toString(),
        netProfit: netProfit.toString(),
        netProfitPercentage: netProfitPercentage.toFixed(4),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`Error calculating arbitrage: ${error}`);
      return null;
    }
  }

  // Triangular arbitrage: A -> B -> C -> A
  findTriangularArbitrage(
    pricesAB: PriceQuote[],
    pricesBC: PriceQuote[],
    pricesCA: PriceQuote[],
    estimatedGasCostBNB: string = '0.002'
  ): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const priceAB of pricesAB) {
      for (const priceBC of pricesBC) {
        for (const priceCA of pricesCA) {
          // Check if path is valid: A -> B -> C -> A
          if (priceAB.tokenOut !== priceBC.tokenIn || 
              priceBC.tokenOut !== priceCA.tokenIn ||
              priceCA.tokenOut !== priceAB.tokenIn) {
            continue;
          }

          const amountIn = new BigNumber(priceAB.amountIn);
          const amountAfterAB = new BigNumber(priceAB.amountOut);
          const amountAfterBC = new BigNumber(priceBC.amountOut);
          const finalAmount = new BigNumber(priceCA.amountOut);

          const profitAmount = finalAmount.minus(amountIn);
          const profitPercentage = profitAmount.dividedBy(amountIn).multipliedBy(100);

          const gasCost = new BigNumber(estimatedGasCostBNB);
          const netProfit = profitAmount.minus(gasCost);
          const netProfitPercentage = netProfit.dividedBy(amountIn).multipliedBy(100);

          if (netProfitPercentage.isGreaterThan(this.minProfitPercentage)) {
            opportunities.push({
              tokenIn: priceAB.tokenIn,
              tokenOut: priceCA.tokenOut,
              buyDex: `${priceAB.dex} -> ${priceBC.dex} -> ${priceCA.dex}`,
              sellDex: 'Triangular',
              buyPrice: '0',
              sellPrice: '0',
              amountIn: amountIn.toString(),
              expectedAmountOut: finalAmount.toString(),
              profitAmount: profitAmount.toString(),
              profitPercentage: profitPercentage.toFixed(4),
              estimatedGasCost: gasCost.toString(),
              netProfit: netProfit.toString(),
              netProfitPercentage: netProfitPercentage.toFixed(4),
              timestamp: Date.now()
            });
          }
        }
      }
    }

    return opportunities.sort((a, b) => 
      new BigNumber(b.netProfitPercentage).comparedTo(new BigNumber(a.netProfitPercentage))
    );
  }
}
