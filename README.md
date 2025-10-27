# BSC DEX Arbitrage Bot - Production Ready

Bot arbitrase DEX ultimate untuk Binance Smart Chain (BSC) yang memantau 30 token di 5 DEX secara real-time menggunakan RPC.

## 🚀 Features

### Core Features
- ✅ **Multi-DEX Support**: PancakeSwap V2, ApeSwap, Biswap, BabySwap, MDEX
- ✅ **30 Token Configuration**: WBNB, BUSD, USDT, ETH, BTCB, CAKE, dan 24 token lainnya
- ✅ **Real-time Price Monitoring**: Menggunakan RPC untuk akurasi maksimal
- ✅ **Arbitrage Detection**: Simple arbitrage (2-hop) dan triangular arbitrage (3-hop)
- ✅ **Profitability Calculator**: Menghitung profit setelah gas fee dan slippage

### Safety Features
- 🛡️ **Honeypot Detection**: Deteksi token scam otomatis
- 🛡️ **Circuit Breaker**: Auto-stop setelah consecutive failures
- 🛡️ **Slippage Protection**: Configurable max slippage
- 🛡️ **Gas Price Limiter**: Batasi gas price maksimal
- 🛡️ **Token Blacklist**: Blacklist token berbahaya

### Monitoring & Logging
- 📊 **Real-time Statistics**: Track opportunities, trades, profit
- 📝 **Comprehensive Logging**: Winston logger dengan file output
- 📈 **Performance Metrics**: Success rate, uptime, consecutive failures

## 📁 Project Structure

```
bsc-arbitrage-bot/
├── src/
│   ├── bot/
│   │   └── ArbitrageBot.ts          # Main bot logic
│   ├── config/
│   │   ├── tokens.ts                # 30 token configuration
│   │   ├── dexes.ts                 # 5 DEX configuration
│   │   └── index.ts                 # Main config
│   ├── contracts/
│   │   └── abis.ts                  # Smart contract ABIs
│   ├── services/
│   │   ├── PriceService.ts          # Price fetching from DEXes
│   │   ├── ArbitrageService.ts      # Arbitrage detection
│   │   ├── TradeService.ts          # Trade execution
│   │   ├── SafetyService.ts         # Safety checks
│   │   └── MonitorService.ts        # Monitoring & stats
│   ├── utils/
│   │   ├── logger.ts                # Winston logger
│   │   └── helpers.ts               # Helper functions
│   └── index.ts                     # Entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js v18+ 
- npm or yarn
- BSC wallet with private key
- BNB for gas fees

### Setup

1. **Clone & Install**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# BSC RPC (gunakan RPC premium untuk performa terbaik)
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_RPC_URL_BACKUP=https://bsc-dataseed2.binance.org/

# Private Key (JANGAN SHARE!)
PRIVATE_KEY=your_private_key_here

# Trading Configuration
MIN_PROFIT_PERCENTAGE=0.5        # Minimum 0.5% profit
MAX_SLIPPAGE=1.0                 # Max 1% slippage
GAS_PRICE_MULTIPLIER=1.1         # 10% di atas gas price
MAX_GAS_PRICE_GWEI=10            # Max 10 gwei

# Trade Amount
TRADE_AMOUNT_BNB=0.1             # Amount per trade

# Safety
ENABLE_HONEYPOT_CHECK=true
ENABLE_CIRCUIT_BREAKER=true
MAX_CONSECUTIVE_FAILURES=3

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

3. **Build**
```bash
npm run build
```

## 🎯 Usage

### Development Mode
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

## ⚙️ Configuration

### Token Configuration (`src/config/tokens.ts`)
30 token sudah dikonfigurasi:
- Stablecoins: BUSD, USDT, USDC, DAI, TUSD
- Major: WBNB, ETH, BTCB
- DeFi: CAKE, BANANA, ALPACA, BAKE, XVS
- Layer 1: ADA, DOT, ATOM, EOS, TRX
- Others: DOGE, MATIC, LINK, UNI, LTC, dll

### DEX Configuration (`src/config/dexes.ts`)
5 DEX dengan fee berbeda:
- PancakeSwap V2: 0.25%
- ApeSwap: 0.20%
- Biswap: 0.10%
- BabySwap: 0.10%
- MDEX: 0.30%

### Arbitrage Pairs
Priority pairs untuk scanning:
- WBNB/BUSD, WBNB/USDT, WBNB/ETH
- BUSD/USDT, BUSD/USDC
- CAKE/WBNB, BANANA/WBNB
- Dan lainnya...

## 🔐 Security Best Practices

1. **Private Key**
   - JANGAN commit private key ke git
   - Gunakan hardware wallet untuk production
   - Rotate key secara berkala

2. **RPC Endpoint**
   - Gunakan RPC premium (Ankr, QuickNode, Infura)
   - Setup multiple backup RPC
   - Monitor rate limits

3. **Fund Management**
   - Jangan simpan semua fund di bot wallet
   - Setup auto-withdrawal ke cold wallet
   - Monitor balance secara real-time

4. **Risk Management**
   - Start dengan amount kecil
   - Enable circuit breaker
   - Set reasonable profit threshold
   - Monitor gas prices

## 📊 Monitoring

Bot akan menampilkan:
- Real-time opportunity detection
- Trade execution results
- Statistics setiap 10 scan
- Error logs dan warnings

Example output:
```
═══════════════════════════════════════════════════════
🎯 ARBITRAGE OPPORTUNITY FOUND #1
   Pair: WBNB/BUSD
   Buy on: ApeSwap @ 305.50
   Sell on: PancakeSwap V2 @ 307.20
   Amount In: 0.1 WBNB
   Expected Out: 0.1055 WBNB
   Gross Profit: 0.0055 (5.5%)
   Gas Cost: 0.001 BNB
   Net Profit: 0.0045 (4.5%)
═══════════════════════════════════════════════════════
```

## 🛠️ Maintenance & Development

### Adding New Token
Edit `src/config/tokens.ts`:
```typescript
NEW_TOKEN: {
  symbol: 'NEW',
  address: '0x...',
  decimals: 18
}
```

### Adding New DEX
Edit `src/config/dexes.ts`:
```typescript
NEW_DEX: {
  name: 'NewDex',
  routerAddress: '0x...',
  factoryAddress: '0x...',
  initCodeHash: '0x...',
  fee: 25
}
```

### Modifying Strategy
Edit `src/services/ArbitrageService.ts` untuk custom logic:
- Profit calculation
- Opportunity filtering
- Multi-hop strategies

## 🐛 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Pastikan wallet punya BNB untuk gas
   - Check token balance

2. **"Transaction failed"**
   - Gas price terlalu rendah
   - Slippage terlalu ketat
   - Liquidity berubah

3. **"RPC connection failed"**
   - Check RPC endpoint
   - Try backup RPC
   - Check internet connection

4. **"No opportunities found"**
   - Market kondisi stabil
   - Profit threshold terlalu tinggi
   - Liquidity rendah

## 📈 Performance Optimization

1. **RPC Optimization**
   - Gunakan RPC premium dengan rate limit tinggi
   - Setup load balancing multiple RPC
   - Cache pair addresses

2. **Execution Speed**
   - Reduce scan interval (hati-hati rate limit)
   - Optimize gas price strategy
   - Use flashbots/MEV for priority

3. **Profit Maximization**
   - Fine-tune profit threshold
   - Optimize trade amount
   - Consider triangular arbitrage

## ⚠️ Disclaimer

**IMPORTANT**: 
- Bot ini untuk educational purposes
- Trading crypto berisiko tinggi
- DYOR (Do Your Own Research)
- Test di testnet dulu
- Tidak ada jaminan profit
- Author tidak bertanggung jawab atas losses

## 📝 License

MIT License - Use at your own risk

## 🤝 Contributing

Contributions welcome! Areas untuk improvement:
- Flashloan integration
- MEV bundle support
- Multi-chain support
- Advanced strategies
- Better UI/dashboard
- Telegram notifications

## 📞 Support

Untuk issues dan questions, buka GitHub Issues.

---

**Happy Trading! 🚀💰**

*Remember: The house always wins, but with the right bot, you can be the house.*
