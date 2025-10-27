import dotenv from 'dotenv';
import { TOKENS, ARBITRAGE_PAIRS } from './tokens';
import { DEXES, DEX_LIST } from './dexes';

dotenv.config();

export interface BotConfig {
  rpcUrl: string;
  rpcBackupUrls: string[];
  privateKey: string;
  minProfitPercentage: number;
  maxSlippage: number;
  gasPriceMultiplier: number;
  maxGasPriceGwei: number;
  tradeAmountBNB: string;
  enableHoneypotCheck: boolean;
  enableCircuitBreaker: boolean;
  maxConsecutiveFailures: number;
  logLevel: string;
  logToFile: boolean;
}

export const config: BotConfig = {
  rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
  rpcBackupUrls: [
    process.env.BSC_RPC_URL_BACKUP || 'https://bsc-dataseed2.binance.org/',
    process.env.BSC_RPC_URL_BACKUP2 || 'https://bsc-dataseed3.binance.org/'
  ],
  privateKey: process.env.PRIVATE_KEY || '',
  minProfitPercentage: parseFloat(process.env.MIN_PROFIT_PERCENTAGE || '0.5'),
  maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '1.0'),
  gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.1'),
  maxGasPriceGwei: parseFloat(process.env.MAX_GAS_PRICE_GWEI || '10'),
  tradeAmountBNB: process.env.TRADE_AMOUNT_BNB || '0.1',
  enableHoneypotCheck: process.env.ENABLE_HONEYPOT_CHECK === 'true',
  enableCircuitBreaker: process.env.ENABLE_CIRCUIT_BREAKER === 'true',
  maxConsecutiveFailures: parseInt(process.env.MAX_CONSECUTIVE_FAILURES || '3'),
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true'
};

export { TOKENS, ARBITRAGE_PAIRS, DEXES, DEX_LIST };
