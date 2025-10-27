# 🔧 Troubleshooting Guide

Solusi untuk masalah umum yang mungkin terjadi saat menjalankan bot.

## 🚨 Common Errors

### 1. "Insufficient funds for gas"

**Penyebab**:
- Wallet tidak punya cukup BNB untuk gas fee
- Gas price terlalu tinggi

**Solusi**:
```bash
# Check balance
npm run dev
# Dalam bot, akan terlihat balance

# Transfer BNB ke wallet
# Minimal 0.1 BNB untuk testing
```

**Prevention**:
- Monitor balance secara regular
- Set alert untuk low balance
- Auto top-up dari main wallet

### 2. "Transaction underpriced"

**Penyebab**:
- Gas price terlalu rendah
- Network congestion

**Solusi**:
```env
# Increase gas price multiplier in .env
GAS_PRICE_MULTIPLIER=1.5
MAX_GAS_PRICE_GWEI=15
```

### 3. "Execution reverted: INSUFFICIENT_OUTPUT_AMOUNT"

**Penyebab**:
- Slippage terlalu ketat
- Price moved before execution
- Front-running

**Solusi**:
```env
# Increase max slippage
MAX_SLIPPAGE=2.0
```

**Code Fix**:
```typescript
// In TradeService.ts, adjust slippage calculation
const minAmountOut = expectedAmountOut
  .multipliedBy(0.97)  // 3% slippage
  .integerValue(BigNumber.ROUND_DOWN);
```

### 4. "RPC Error: Too many requests"

**Penyebab**:
- Rate limit exceeded
- Free RPC endpoint limitations

**Solusi**:
```env
# Use premium RPC
BSC_RPC_URL=https://bsc-dataseed.binance.org/
# Or paid services:
# https://rpc.ankr.com/bsc/YOUR_API_KEY
# https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
```

**Code Fix**:
```typescript
// Add rate limiting
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent requests
const promises = dexes.map(dex => 
  limit(() => this.getPrice(dex, tokenIn, tokenOut, amountIn))
);
```

### 5. "Nonce too low"

**Penyebab**:
- Transaction nonce conflict
- Multiple transactions sent simultaneously

**Solusi**:
```typescript
// In TradeService.ts, manage nonce manually
private nonce: number | null = null;

async getNextNonce(): Promise<number> {
  if (this.nonce === null) {
    this.nonce = await this.wallet.getNonce();
  } else {
    this.nonce++;
  }
  return this.nonce;
}

// Use in transaction
const tx = await router.swapExactTokensForTokens(..., {
  nonce: await this.getNextNonce()
});
```

### 6. "Cannot read property 'getAmountsOut' of undefined"

**Penyebab**:
- Router contract address salah
- Network connection issue

**Solusi**:
```typescript
// Add validation
async validateDexConfig(dex: DexConfig): Promise<boolean> {
  try {
    const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, this.provider);
    const code = await this.provider.getCode(dex.routerAddress);
    return code !== '0x';
  } catch {
    return false;
  }
}
```

## 🐛 Debugging Tips

### Enable Debug Logging
```env
LOG_LEVEL=debug
```

### Check Specific Module
```typescript
// In any service file
import { logger } from '../utils/logger';

logger.debug('Price fetched:', { dex, price, timestamp });
logger.debug('Reserves:', { reserve0, reserve1 });
```

### Monitor Gas Usage
```typescript
// Add to TradeService.ts
const receipt = await tx.wait();
logger.info(`Gas used: ${receipt.gasUsed.toString()}`);
logger.info(`Gas price: ${ethers.formatUnits(receipt.gasPrice, 'gwei')} gwei`);
logger.info(`Total cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} BNB`);
```

### Test Individual Components
```typescript
// test-price.ts
import { PriceService } from './services/PriceService';

async function testPrice() {
  const service = new PriceService(provider);
  const price = await service.getPrice(DEXES.PANCAKESWAP_V2, TOKENS.WBNB, TOKENS.BUSD, '1');
  console.log('Price:', price);
}

testPrice();
```

## 🔍 Performance Issues

### Bot Running Slow

**Check 1: RPC Latency**
```bash
# Test RPC response time
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/
```

**Check 2: CPU Usage**
```bash
# Monitor resources
htop
# Or
pm2 monit
```

**Solution**:
```typescript
// Optimize concurrent requests
const BATCH_SIZE = 5;
for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
  const batch = pairs.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(pair => this.scanPair(pair)));
}
```

### Memory Leaks

**Symptoms**:
- Memory usage increasing over time
- Bot crashes after hours of running

**Solution**:
```typescript
// Clear old data periodically
class PriceCache {
  private cache: Map<string, PriceQuote> = new Map();
  private maxAge = 60000; // 1 minute

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => priceCache.cleanup(), 300000);
```

## 💰 Trading Issues

### No Opportunities Found

**Possible Causes**:
1. Profit threshold too high
2. Market too efficient
3. Insufficient liquidity
4. Wrong token pairs

**Solutions**:
```env
# Lower profit threshold temporarily
MIN_PROFIT_PERCENTAGE=0.3

# Increase trade amount for better opportunities
TRADE_AMOUNT_BNB=0.5
```

**Add More Pairs**:
```typescript
// In tokens.ts
export const ARBITRAGE_PAIRS = [
  ['WBNB', 'BUSD'],
  ['WBNB', 'USDT'],
  ['CAKE', 'BUSD'],
  ['BANANA', 'WBNB'],
  // Add more volatile pairs
  ['DOGE', 'WBNB'],
  ['SHIB', 'WBNB']
];
```

### Trades Failing

**Check 1: Token Approval**
```typescript
// Verify approval
const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
const allowance = await token.allowance(wallet.address, routerAddress);
console.log('Allowance:', ethers.formatEther(allowance));
```

**Check 2: Liquidity**
```typescript
// Check if pair has enough liquidity
const reserves = await pair.getReserves();
console.log('Reserve0:', ethers.formatEther(reserves[0]));
console.log('Reserve1:', ethers.formatEther(reserves[1]));
```

**Check 3: Honeypot**
```typescript
// Test if token is tradeable
const isSafe = await safetyService.checkTokenSafety(tokenAddress);
if (!isSafe) {
  logger.warn('Token might be honeypot!');
}
```

## 🔐 Security Issues

### Private Key Exposed

**Immediate Actions**:
1. Stop bot immediately
2. Transfer all funds to new wallet
3. Revoke all approvals
4. Generate new private key
5. Update .env file
6. Never reuse compromised key

**Prevention**:
```bash
# Set proper file permissions
chmod 600 .env

# Add to .gitignore
echo ".env" >> .gitignore

# Use hardware wallet for production
# Or use encrypted key storage
```

### Suspicious Activity

**Monitor**:
```typescript
// Add transaction monitoring
class SecurityMonitor {
  async checkTransaction(txHash: string): Promise<void> {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    // Check for unusual gas usage
    if (receipt.gasUsed > 500000n) {
      logger.warn('High gas usage detected!');
    }
    
    // Check for failed transactions
    if (receipt.status === 0) {
      logger.error('Transaction failed!');
    }
  }
}
```

## 📊 Monitoring Issues

### Logs Not Showing

**Check**:
```bash
# Verify log directory exists
mkdir -p logs

# Check permissions
ls -la logs/

# Check PM2 logs
pm2 logs arbitrage-bot
```

**Fix**:
```typescript
// Ensure logger is initialized
import { logger } from './utils/logger';

// Force console output
logger.add(new winston.transports.Console({
  format: winston.format.simple()
}));
```

### Stats Not Updating

**Check**:
```typescript
// Verify MonitorService is called
this.monitorService.recordOpportunity(opportunity);
this.monitorService.recordTrade(result, opportunity);

// Print stats manually
this.monitorService.printStats();
```

## 🆘 Emergency Procedures

### Bot Stuck

```bash
# Force restart
pm2 restart arbitrage-bot --force

# Or kill process
pm2 delete arbitrage-bot
pm2 start ecosystem.config.js
```

### Funds Stuck in Contract

```typescript
// Emergency withdrawal function
async emergencyWithdraw(tokenAddress: string): Promise<void> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const balance = await token.balanceOf(wallet.address);
  
  if (balance > 0n) {
    const tx = await token.transfer(SAFE_WALLET_ADDRESS, balance);
    await tx.wait();
    logger.info(`Withdrawn ${ethers.formatEther(balance)} tokens`);
  }
}
```

### Circuit Breaker Activated

```bash
# Check stats
pm2 logs arbitrage-bot | grep "CIRCUIT BREAKER"

# Reset manually
# In bot console or add admin endpoint
monitorService.resetCircuitBreaker();
```

## 📞 Getting Help

### Before Asking for Help

1. Check logs: `pm2 logs arbitrage-bot`
2. Check this troubleshooting guide
3. Search GitHub issues
4. Test on testnet first

### Information to Provide

```
- Bot version
- Node.js version
- Operating system
- Error message (full stack trace)
- Configuration (without private key!)
- Steps to reproduce
- Expected vs actual behavior
```

### Useful Commands

```bash
# System info
node --version
npm --version
pm2 --version

# Bot info
pm2 info arbitrage-bot
pm2 logs arbitrage-bot --lines 100

# Network info
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/
```

## 🔄 Recovery Procedures

### Restore from Backup

```bash
# Stop bot
pm2 stop arbitrage-bot

# Restore .env
cp backup/.env .env

# Restore code
git reset --hard HEAD

# Rebuild
npm install
npm run build

# Restart
pm2 restart arbitrage-bot
```

### Reset Bot State

```bash
# Clear logs
rm -rf logs/*

# Clear cache (if implemented)
rm -rf cache/*

# Rebuild
npm run build

# Fresh start
pm2 restart arbitrage-bot
```

---

**Still having issues?** Open a GitHub issue with detailed information! 🆘
