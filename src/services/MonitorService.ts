import { logger } from '../utils/logger';
import { ArbitrageOpportunity } from './ArbitrageService';
import { TradeResult } from './TradeService';

export interface BotStats {
  totalOpportunitiesFound: number;
  totalTradesExecuted: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: string;
  consecutiveFailures: number;
  uptime: number;
  startTime: number;
}

export class MonitorService {
  private stats: BotStats;
  private maxConsecutiveFailures: number;
  private circuitBreakerActive: boolean = false;

  constructor(maxConsecutiveFailures: number = 3) {
    this.maxConsecutiveFailures = maxConsecutiveFailures;
    this.stats = {
      totalOpportunitiesFound: 0,
      totalTradesExecuted: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalProfit: '0',
      consecutiveFailures: 0,
      uptime: 0,
      startTime: Date.now()
    };
  }

  recordOpportunity(opportunity: ArbitrageOpportunity): void {
    this.stats.totalOpportunitiesFound++;
    logger.info('═══════════════════════════════════════════════════════');
    logger.info(`🎯 ARBITRAGE OPPORTUNITY FOUND #${this.stats.totalOpportunitiesFound}`);
    logger.info(`   Pair: ${opportunity.tokenIn}/${opportunity.tokenOut}`);
    logger.info(`   Buy on: ${opportunity.buyDex} @ ${opportunity.buyPrice}`);
    logger.info(`   Sell on: ${opportunity.sellDex} @ ${opportunity.sellPrice}`);
    logger.info(`   Amount In: ${opportunity.amountIn} ${opportunity.tokenIn}`);
    logger.info(`   Expected Out: ${opportunity.expectedAmountOut} ${opportunity.tokenIn}`);
    logger.info(`   Gross Profit: ${opportunity.profitAmount} (${opportunity.profitPercentage}%)`);
    logger.info(`   Gas Cost: ${opportunity.estimatedGasCost} BNB`);
    logger.info(`   Net Profit: ${opportunity.netProfit} (${opportunity.netProfitPercentage}%)`);
    logger.info('═══════════════════════════════════════════════════════');
  }

  recordTrade(result: TradeResult, opportunity: ArbitrageOpportunity): void {
    this.stats.totalTradesExecuted++;

    if (result.success) {
      this.stats.successfulTrades++;
      this.stats.consecutiveFailures = 0;
      
      logger.info('✅ TRADE SUCCESSFUL');
      logger.info(`   TX Hash: ${result.txHash}`);
      logger.info(`   Gas Used: ${result.gasUsed}`);
      logger.info(`   Amount Out: ${result.amountOut}`);
      
      // Update total profit
      const currentProfit = parseFloat(this.stats.totalProfit);
      const newProfit = currentProfit + parseFloat(opportunity.netProfit);
      this.stats.totalProfit = newProfit.toFixed(6);
    } else {
      this.stats.failedTrades++;
      this.stats.consecutiveFailures++;
      
      logger.error('❌ TRADE FAILED');
      logger.error(`   Error: ${result.error}`);
      
      // Check circuit breaker
      if (this.stats.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.activateCircuitBreaker();
      }
    }
  }

  private activateCircuitBreaker(): void {
    this.circuitBreakerActive = true;
    logger.error('🚨 CIRCUIT BREAKER ACTIVATED!');
    logger.error(`   Consecutive failures: ${this.stats.consecutiveFailures}`);
    logger.error('   Bot will pause trading for safety.');
  }

  resetCircuitBreaker(): void {
    this.circuitBreakerActive = false;
    this.stats.consecutiveFailures = 0;
    logger.info('✅ Circuit breaker reset. Resuming normal operations.');
  }

  isCircuitBreakerActive(): boolean {
    return this.circuitBreakerActive;
  }

  getStats(): BotStats {
    this.stats.uptime = Date.now() - this.stats.startTime;
    return { ...this.stats };
  }

  printStats(): void {
    const stats = this.getStats();
    const uptimeMinutes = Math.floor(stats.uptime / 60000);
    const successRate = stats.totalTradesExecuted > 0 
      ? ((stats.successfulTrades / stats.totalTradesExecuted) * 100).toFixed(2)
      : '0.00';

    logger.info('');
    logger.info('╔═══════════════════════════════════════════════════════╗');
    logger.info('║                    BOT STATISTICS                     ║');
    logger.info('╠═══════════════════════════════════════════════════════╣');
    logger.info(`║ Uptime: ${uptimeMinutes} minutes`);
    logger.info(`║ Opportunities Found: ${stats.totalOpportunitiesFound}`);
    logger.info(`║ Trades Executed: ${stats.totalTradesExecuted}`);
    logger.info(`║ Successful: ${stats.successfulTrades} | Failed: ${stats.failedTrades}`);
    logger.info(`║ Success Rate: ${successRate}%`);
    logger.info(`║ Total Profit: ${stats.totalProfit} BNB`);
    logger.info(`║ Consecutive Failures: ${stats.consecutiveFailures}`);
    logger.info(`║ Circuit Breaker: ${this.circuitBreakerActive ? '🔴 ACTIVE' : '🟢 INACTIVE'}`);
    logger.info('╚═══════════════════════════════════════════════════════╝');
    logger.info('');
  }
}
