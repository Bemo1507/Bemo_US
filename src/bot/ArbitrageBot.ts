import { ethers } from 'ethers';
import { config, TOKENS, ARBITRAGE_PAIRS, DEXES, DEX_LIST } from '../config';
import { PriceService } from '../services/PriceService';
import { ArbitrageService } from '../services/ArbitrageService';
import { TradeService } from '../services/TradeService';
import { MonitorService } from '../services/MonitorService';
import { logger } from '../utils/logger';
import { sleep } from '../utils/helpers';

export class ArbitrageBot {
  private provider: ethers.JsonRpcProvider;
  private priceService: PriceService;
  private arbitrageService: ArbitrageService;
  private tradeService: TradeService;
  private monitorService: MonitorService;
  private isRunning: boolean = false;
  private scanInterval: number = 3000; // 3 seconds

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.priceService = new PriceService(this.provider);
    this.arbitrageService = new ArbitrageService();
    this.tradeService = new TradeService(this.provider, config.privateKey);
    this.monitorService = new MonitorService(config.maxConsecutiveFailures);
  }

  async start(): Promise<void> {
    logger.info('🚀 Starting BSC Arbitrage Bot...');
    logger.info(`📡 RPC: ${config.rpcUrl}`);
    logger.info(`💰 Min Profit: ${config.minProfitPercentage}%`);
    logger.info(`⚡ Max Slippage: ${config.maxSlippage}%`);
    logger.info(`🔧 Trade Amount: ${config.tradeAmountBNB} BNB`);
    logger.info('');

    // Validate configuration
    if (!config.privateKey || config.privateKey === '') {
      logger.error('❌ Private key not configured! Please set PRIVATE_KEY in .env file');
      return;
    }

    // Test connection
    try {
      const blockNumber = await this.provider.getBlockNumber();
      logger.info(`✅ Connected to BSC. Current block: ${blockNumber}`);
    } catch (error) {
      logger.error(`❌ Failed to connect to RPC: ${error}`);
      return;
    }

    this.isRunning = true;
    logger.info('✅ Bot started successfully!');
    logger.info('');

    // Main loop
    await this.run();
  }

  private async run(): Promise<void> {
    let scanCount = 0;

    while (this.isRunning) {
      try {
        scanCount++;
        logger.info(`🔍 Scan #${scanCount} - Searching for opportunities...`);

        // Check circuit breaker
        if (config.enableCircuitBreaker && this.monitorService.isCircuitBreakerActive()) {
          logger.warn('⚠️  Circuit breaker is active. Waiting 60 seconds...');
          await sleep(60000);
          this.monitorService.resetCircuitBreaker();
          continue;
        }

        // Scan all configured pairs
        for (const [tokenInSymbol, tokenOutSymbol] of ARBITRAGE_PAIRS) {
          const tokenIn = TOKENS[tokenInSymbol];
          const tokenOut = TOKENS[tokenOutSymbol];

          if (!tokenIn || !tokenOut) {
            logger.warn(`Token pair ${tokenInSymbol}/${tokenOutSymbol} not found in config`);
            continue;
          }

          // Get prices from all DEXes
          const dexConfigs = DEX_LIST.map(dexName => DEXES[dexName]);
          const prices = await this.priceService.getPricesFromAllDexes(
            dexConfigs,
            tokenIn,
            tokenOut,
            config.tradeAmountBNB
          );

          if (prices.length < 2) {
            logger.debug(`Not enough price quotes for ${tokenInSymbol}/${tokenOutSymbol}`);
            continue;
          }

          // Find arbitrage opportunities
          const opportunities = this.arbitrageService.findArbitrageOpportunities(prices);

          if (opportunities.length > 0) {
            const bestOpportunity = opportunities[0];
            this.monitorService.recordOpportunity(bestOpportunity);

            // Execute trade if profitable
            if (parseFloat(bestOpportunity.netProfitPercentage) >= config.minProfitPercentage) {
              logger.info('💎 Executing arbitrage trade...');

              const buyDex = Object.values(DEXES).find(d => d.name === bestOpportunity.buyDex);
              const sellDex = Object.values(DEXES).find(d => d.name === bestOpportunity.sellDex);

              if (buyDex && sellDex) {
                const result = await this.tradeService.executeArbitrage(
                  buyDex,
                  sellDex,
                  tokenIn,
                  tokenOut,
                  bestOpportunity.amountIn
                );

                this.monitorService.recordTrade(result, bestOpportunity);
              }
            }
          }
        }

        // Print stats every 10 scans
        if (scanCount % 10 === 0) {
          this.monitorService.printStats();
        }

        // Wait before next scan
        await sleep(this.scanInterval);
      } catch (error) {
        logger.error(`Error in main loop: ${error}`);
        await sleep(5000);
      }
    }
  }

  stop(): void {
    logger.info('🛑 Stopping bot...');
    this.isRunning = false;
    this.monitorService.printStats();
    logger.info('✅ Bot stopped.');
  }

  setScanInterval(intervalMs: number): void {
    this.scanInterval = intervalMs;
    logger.info(`Scan interval set to ${intervalMs}ms`);
  }
}
