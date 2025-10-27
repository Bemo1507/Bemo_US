import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ROUTER_ABI, PAIR_ABI, FACTORY_ABI } from '../contracts/abis';
import { DexConfig } from '../config/dexes';
import { TokenConfig } from '../config/tokens';
import { logger } from '../utils/logger';

export interface PriceQuote {
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  price: string;
  reserves?: {
    reserve0: string;
    reserve1: string;
  };
  timestamp: number;
}

export class PriceService {
  private provider: ethers.JsonRpcProvider;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  async getPrice(
    dex: DexConfig,
    tokenIn: TokenConfig,
    tokenOut: TokenConfig,
    amountIn: string
  ): Promise<PriceQuote | null> {
    try {
      const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, this.provider);
      const path = [tokenIn.address, tokenOut.address];
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

      const amounts = await router.getAmountsOut(amountInWei, path);
      const amountOut = amounts[1];

      const amountOutFormatted = ethers.formatUnits(amountOut, tokenOut.decimals);
      const price = new BigNumber(amountOutFormatted).dividedBy(amountIn).toString();

      // Get reserves untuk analisis lebih detail
      const reserves = await this.getReserves(dex, tokenIn.address, tokenOut.address);

      return {
        dex: dex.name,
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        amountOut: amountOutFormatted,
        price,
        reserves,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`Error getting price from ${dex.name} for ${tokenIn.symbol}/${tokenOut.symbol}: ${error}`);
      return null;
    }
  }

  async getPricesFromAllDexes(
    dexes: DexConfig[],
    tokenIn: TokenConfig,
    tokenOut: TokenConfig,
    amountIn: string
  ): Promise<PriceQuote[]> {
    const pricePromises = dexes.map(dex => this.getPrice(dex, tokenIn, tokenOut, amountIn));
    const prices = await Promise.all(pricePromises);
    return prices.filter((price): price is PriceQuote => price !== null);
  }

  private async getReserves(
    dex: DexConfig,
    tokenA: string,
    tokenB: string
  ): Promise<{ reserve0: string; reserve1: string } | undefined> {
    try {
      const factory = new ethers.Contract(dex.factoryAddress, FACTORY_ABI, this.provider);
      const pairAddress = await factory.getPair(tokenA, tokenB);

      if (pairAddress === ethers.ZeroAddress) {
        return undefined;
      }

      const pair = new ethers.Contract(pairAddress, PAIR_ABI, this.provider);
      const reserves = await pair.getReserves();

      return {
        reserve0: reserves[0].toString(),
        reserve1: reserves[1].toString()
      };
    } catch (error) {
      logger.debug(`Could not get reserves for ${tokenA}/${tokenB} on ${dex.name}`);
      return undefined;
    }
  }

  async checkPairExists(dex: DexConfig, tokenA: string, tokenB: string): Promise<boolean> {
    try {
      const factory = new ethers.Contract(dex.factoryAddress, FACTORY_ABI, this.provider);
      const pairAddress = await factory.getPair(tokenA, tokenB);
      return pairAddress !== ethers.ZeroAddress;
    } catch (error) {
      return false;
    }
  }
}
