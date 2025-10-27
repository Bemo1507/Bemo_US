import { ArbitrageBot } from './bot/ArbitrageBot';
import { logger } from './utils/logger';

async function main() {
  logger.info('╔═══════════════════════════════════════════════════════╗');
  logger.info('║         BSC DEX ARBITRAGE BOT - PRODUCTION            ║');
  logger.info('║              Ultimate Trading System                  ║');
  logger.info('╚═══════════════════════════════════════════════════════╝');
  logger.info('');

  const bot = new ArbitrageBot();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('');
    logger.info('Received SIGINT signal...');
    bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('');
    logger.info('Received SIGTERM signal...');
    bot.stop();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    logger.error(error.stack || '');
    bot.stop();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}`);
    logger.error(`Reason: ${reason}`);
  });

  // Start the bot
  try {
    await bot.start();
  } catch (error) {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

main();
