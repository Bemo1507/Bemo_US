# ⚡ Quick Start Guide

Get your BSC Arbitrage Bot running in 5 minutes!

## 🎯 Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] BSC wallet with private key
- [ ] At least 0.2 BNB in wallet (0.1 for trading + 0.1 for gas)
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/Command prompt

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure Environment (2 min)
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

**Minimal Configuration**:
```env
# REQUIRED: Your BSC RPC endpoint
BSC_RPC_URL=https://bsc-dataseed1.binance.org/

# REQUIRED: Your wallet private key (KEEP SECRET!)
PRIVATE_KEY=your_private_key_here

# OPTIONAL: Adjust these if needed
MIN_PROFIT_PERCENTAGE=0.5
TRADE_AMOUNT_BNB=0.1
```

### Step 3: Build (1 min)
```bash
npm run build
```

### Step 4: Start Bot (1 min)
```bash
npm start
```

That's it! Your bot is now running! 🎉

## 📊 What You Should See

```
╔═══════════════════════════════════════════════════════╗
║         BSC DEX ARBITRAGE BOT - PRODUCTION            ║
║              Ultimate Trading System                  ║
╚═══════════════════════════════════════════════════════╝

🚀 Starting BSC Arbitrage Bot...
📡 RPC: https://bsc-dataseed1.binance.org/
💰 Min Profit: 0.5%
⚡ Max Slippage: 1.0%
🔧 Trade Amount: 0.1 BNB

✅ Connected to BSC. Current block: 12345678
✅ Bot started successfully!

🔍 Scan #1 - Searching for opportunities...
```

## 🎮 Basic Commands

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Build Only
```bash
npm run build
```

### Stop Bot (if running with PM2)
```bash
pm2 stop arbitrage-bot
```

### View Logs (PM2)
```bash
pm2 logs arbitrage-bot
```

## ⚙️ Quick Configuration Guide

### Adjust Profit Threshold
```env
# More conservative (fewer opportunities, higher profit)
MIN_PROFIT_PERCENTAGE=1.0

# More aggressive (more opportunities, lower profit)
MIN_PROFIT_PERCENTAGE=0.3
```

### Adjust Trade Amount
```env
# Smaller trades (less risk, less profit)
TRADE_AMOUNT_BNB=0.05

# Larger trades (more risk, more profit)
TRADE_AMOUNT_BNB=0.5
```

### Adjust Gas Settings
```env
# Faster execution (higher gas cost)
GAS_PRICE_MULTIPLIER=1.5
MAX_GAS_PRICE_GWEI=15

# Cheaper execution (slower, might fail)
GAS_PRICE_MULTIPLIER=1.0
MAX_GAS_PRICE_GWEI=5
```

## 🔍 Monitoring Your Bot

### Check Statistics
Bot automatically prints stats every 10 scans:
```
╔═══════════════════════════════════════════════════════╗
║                    BOT STATISTICS                     ║
╠═══════════════════════════════════════════════════════╣
║ Uptime: 30 minutes
║ Opportunities Found: 15
║ Trades Executed: 3
║ Successful: 3 | Failed: 0
║ Success Rate: 100.00%
║ Total Profit: 0.0045 BNB
║ Consecutive Failures: 0
║ Circuit Breaker: 🟢 INACTIVE
╚═══════════════════════════════════════════════════════╝
```

### Check Logs
```bash
# Real-time logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Last 100 lines
tail -n 100 logs/combined.log
```

## 🎯 First Trade Checklist

Before executing your first real trade:

- [ ] Tested on BSC Testnet
- [ ] Verified wallet has sufficient BNB
- [ ] Checked RPC connection is stable
- [ ] Set conservative profit threshold (1%+)
- [ ] Started with small trade amount (0.05 BNB)
- [ ] Enabled all safety features
- [ ] Monitoring logs in real-time
- [ ] Have emergency stop plan ready

## 🛑 How to Stop the Bot

### If running directly:
```bash
# Press Ctrl+C in terminal
```

### If running with PM2:
```bash
pm2 stop arbitrage-bot
```

### Emergency stop:
```bash
# Kill all node processes (use with caution!)
pkill -9 node
```

## 🐛 Quick Troubleshooting

### Bot won't start
```bash
# Check Node.js version
node --version  # Should be v18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### "Private key not configured"
```bash
# Make sure .env file exists
ls -la .env

# Check if PRIVATE_KEY is set
cat .env | grep PRIVATE_KEY
```

### "Cannot connect to RPC"
```bash
# Test RPC manually
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/

# Try backup RPC
BSC_RPC_URL=https://bsc-dataseed2.binance.org/
```

### No opportunities found
```bash
# Lower profit threshold
MIN_PROFIT_PERCENTAGE=0.3

# Increase trade amount
TRADE_AMOUNT_BNB=0.2

# Wait longer (market needs volatility)
```

## 📚 Next Steps

### 1. Optimize Configuration
- Read [README.md](README.md) for detailed configuration options
- Adjust settings based on your risk tolerance
- Monitor performance and iterate

### 2. Deploy to Production
- Follow [DEPLOYMENT.md](DEPLOYMENT.md) for VPS/cloud deployment
- Setup PM2 for process management
- Configure monitoring and alerts

### 3. Advanced Features
- Read [ADVANCED_STRATEGIES.md](ADVANCED_STRATEGIES.md)
- Implement custom trading strategies
- Add more token pairs and DEXes

### 4. Monitor & Maintain
- Check logs regularly
- Track profitability
- Update configuration as needed
- Keep software updated

## 💡 Pro Tips

1. **Start Small**: Begin with 0.05 BNB trades to test the system
2. **Be Patient**: Good opportunities may take time to appear
3. **Monitor Gas**: High gas prices can eat into profits
4. **Use Premium RPC**: Free RPCs have rate limits and higher latency
5. **Enable Safety Features**: Always keep circuit breaker enabled
6. **Test First**: Use testnet before mainnet
7. **Diversify Pairs**: Don't focus on just one token pair
8. **Track Performance**: Keep records of all trades
9. **Stay Updated**: Follow BSC and DEX updates
10. **Manage Risk**: Never trade more than you can afford to lose

## 🆘 Need Help?

- 📖 Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 🐛 Check [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Join community Discord/Telegram (coming soon)
- 📧 Contact support (if available)

## ⚠️ Important Reminders

- **NEVER** share your private key
- **ALWAYS** test on testnet first
- **START** with small amounts
- **MONITOR** your bot regularly
- **UNDERSTAND** the risks involved
- **BACKUP** your configuration
- **SECURE** your server/VPS
- **COMPLY** with local regulations

---

## 🎉 You're Ready!

Your bot is now running and searching for arbitrage opportunities. 

**Remember**: Arbitrage trading requires:
- Fast execution
- Low latency
- Sufficient capital
- Risk management
- Patience

Good luck and happy trading! 🚀💰

---

**Disclaimer**: This software is for educational purposes. Trading cryptocurrencies involves substantial risk. Use at your own risk.
