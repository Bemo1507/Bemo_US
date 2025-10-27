# 📁 Project Structure

Complete overview of the BSC Arbitrage Bot project structure.

## 🌳 Directory Tree

```
bsc-arbitrage-bot/
├── src/                          # Source code
│   ├── bot/                      # Bot core logic
│   │   └── ArbitrageBot.ts      # Main bot orchestrator
│   ├── config/                   # Configuration files
│   │   ├── tokens.ts            # 30 token definitions
│   │   ├── dexes.ts             # 5 DEX configurations
│   │   └── index.ts             # Main config & env loader
│   ├── contracts/                # Smart contract interfaces
│   │   └── abis.ts              # Contract ABIs (Router, Factory, Pair, ERC20)
│   ├── services/                 # Business logic services
│   │   ├── PriceService.ts      # Fetch prices from DEXes
│   │   ├── ArbitrageService.ts  # Detect opportunities
│   │   ├── TradeService.ts      # Execute trades
│   │   ├── SafetyService.ts     # Security checks
│   │   └── MonitorService.ts    # Statistics & monitoring
│   ├── utils/                    # Utility functions
│   │   ├── logger.ts            # Winston logger setup
│   │   └── helpers.ts           # Helper functions
│   └── index.ts                  # Application entry point
├── logs/                         # Log files (auto-generated)
│   ├── combined.log             # All logs
│   └── error.log                # Error logs only
├── dist/                         # Compiled JavaScript (auto-generated)
├── node_modules/                 # Dependencies (auto-generated)
├── docs/                         # Documentation
│   ├── README.md                # Main documentation
│   ├── QUICKSTART.md            # Quick start guide
│   ├── DEPLOYMENT.md            # Deployment guide
│   ├── ADVANCED_STRATEGIES.md   # Advanced trading strategies
│   ├── TROUBLESHOOTING.md       # Troubleshooting guide
│   ├── CHANGELOG.md             # Version history
│   └── PROJECT_STRUCTURE.md     # This file
├── package.json                  # NPM dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── .eslintrc.json               # ESLint configuration
├── ecosystem.config.js          # PM2 configuration
├── .env.example                 # Environment variables template
├── .env                         # Environment variables (DO NOT COMMIT!)
├── .gitignore                   # Git ignore rules
└── LICENSE                      # MIT License

```

## 📄 File Descriptions

### Core Application Files

#### `src/index.ts`
- **Purpose**: Application entry point
- **Responsibilities**:
  - Initialize bot
  - Setup signal handlers (SIGINT, SIGTERM)
  - Handle uncaught errors
  - Start main loop

#### `src/bot/ArbitrageBot.ts`
- **Purpose**: Main bot orchestrator
- **Responsibilities**:
  - Coordinate all services
  - Main scanning loop
  - Opportunity detection
  - Trade execution
  - Statistics reporting
- **Key Methods**:
  - `start()`: Initialize and start bot
  - `run()`: Main scanning loop
  - `stop()`: Graceful shutdown
  - `setScanInterval()`: Adjust scan frequency

### Configuration Files

#### `src/config/tokens.ts`
- **Purpose**: Token definitions
- **Contains**:
  - 30 token configurations (address, symbol, decimals)
  - Arbitrage pair definitions
  - Token metadata (isStable flag)
- **Exports**:
  - `TOKENS`: Token configuration map
  - `ARBITRAGE_PAIRS`: Priority trading pairs
  - `TokenConfig`: TypeScript interface

#### `src/config/dexes.ts`
- **Purpose**: DEX configurations
- **Contains**:
  - 5 DEX configurations
  - Router addresses
  - Factory addresses
  - Init code hashes
  - Fee structures
- **Exports**:
  - `DEXES`: DEX configuration map
  - `DEX_LIST`: Array of DEX names
  - `DexConfig`: TypeScript interface

#### `src/config/index.ts`
- **Purpose**: Main configuration loader
- **Responsibilities**:
  - Load environment variables
  - Parse configuration
  - Export unified config
  - Validate settings
- **Exports**:
  - `config`: Main bot configuration
  - `BotConfig`: TypeScript interface

### Service Files

#### `src/services/PriceService.ts`
- **Purpose**: Price fetching from DEXes
- **Key Methods**:
  - `getPrice()`: Get price from single DEX
  - `getPricesFromAllDexes()`: Fetch from all DEXes
  - `getReserves()`: Get liquidity pool reserves
  - `checkPairExists()`: Verify pair exists
- **Returns**: `PriceQuote` objects

#### `src/services/ArbitrageService.ts`
- **Purpose**: Arbitrage opportunity detection
- **Key Methods**:
  - `findArbitrageOpportunities()`: Detect simple arbitrage
  - `findTriangularArbitrage()`: Detect 3-hop arbitrage
  - `calculateArbitrage()`: Calculate profit/loss
- **Returns**: `ArbitrageOpportunity` objects

#### `src/services/TradeService.ts`
- **Purpose**: Trade execution
- **Key Methods**:
  - `executeArbitrage()`: Execute full arbitrage cycle
  - `executeTrade()`: Execute single swap
  - `ensureApproval()`: Handle token approvals
  - `getBalance()`: Check token balance
- **Returns**: `TradeResult` objects

#### `src/services/SafetyService.ts`
- **Purpose**: Security and validation
- **Key Methods**:
  - `checkHoneypot()`: Detect honeypot tokens
  - `checkTokenSafety()`: Comprehensive safety check
  - `validateTransaction()`: Pre-trade validation
  - `addToBlacklist()`: Blacklist dangerous tokens
- **Features**:
  - Honeypot detection
  - Liquidity checks
  - Token blacklist

#### `src/services/MonitorService.ts`
- **Purpose**: Statistics and monitoring
- **Key Methods**:
  - `recordOpportunity()`: Log opportunity found
  - `recordTrade()`: Log trade execution
  - `getStats()`: Get current statistics
  - `printStats()`: Display formatted stats
  - `activateCircuitBreaker()`: Emergency stop
- **Tracks**:
  - Opportunities found
  - Trades executed
  - Success rate
  - Total profit
  - Uptime

### Utility Files

#### `src/utils/logger.ts`
- **Purpose**: Logging configuration
- **Features**:
  - Winston logger setup
  - Console and file output
  - Colored console logs
  - Timestamp formatting
  - Log rotation support

#### `src/utils/helpers.ts`
- **Purpose**: Helper functions
- **Functions**:
  - `formatAmount()`: Format token amounts
  - `parseAmount()`: Parse token amounts
  - `calculatePriceImpact()`: Calculate price impact
  - `calculateProfit()`: Calculate profit
  - `sleep()`: Async sleep
  - `getDeadline()`: Get transaction deadline

#### `src/contracts/abis.ts`
- **Purpose**: Smart contract ABIs
- **Contains**:
  - Router ABI (swap functions)
  - Factory ABI (pair lookup)
  - Pair ABI (reserves)
  - ERC20 ABI (token functions)

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     ArbitrageBot                        │
│                   (Main Orchestrator)                   │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ PriceService │   │  Arbitrage   │   │    Trade     │
│              │──▶│   Service    │──▶│   Service    │
│ Fetch Prices │   │ Find Opps    │   │ Execute      │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    Safety    │   │   Monitor    │   │    Logger    │
│   Service    │   │   Service    │   │              │
│ Validate     │   │ Track Stats  │   │ Record All   │
└──────────────┘   └──────────────┘   └──────────────┘
```

## 🔄 Execution Flow

1. **Initialization**
   ```
   index.ts → ArbitrageBot.constructor() → Initialize services
   ```

2. **Main Loop**
   ```
   ArbitrageBot.run() → For each pair:
     ├─ PriceService.getPricesFromAllDexes()
     ├─ ArbitrageService.findArbitrageOpportunities()
     ├─ MonitorService.recordOpportunity()
     ├─ SafetyService.validateTransaction()
     ├─ TradeService.executeArbitrage()
     └─ MonitorService.recordTrade()
   ```

3. **Trade Execution**
   ```
   TradeService.executeArbitrage():
     ├─ Buy on DEX A
     │  ├─ ensureApproval()
     │  ├─ getAmountsOut()
     │  └─ swapExactTokensForTokens()
     └─ Sell on DEX B
        ├─ ensureApproval()
        ├─ getAmountsOut()
        └─ swapExactTokensForTokens()
   ```

## 📦 Dependencies

### Production Dependencies
- **ethers** (^6.9.0): Ethereum library for blockchain interaction
- **dotenv** (^16.3.1): Environment variable loader
- **winston** (^3.11.0): Logging library
- **bignumber.js** (^9.1.2): Precise number calculations
- **axios** (^1.6.2): HTTP client

### Development Dependencies
- **typescript** (^5.3.2): TypeScript compiler
- **ts-node** (^10.9.1): TypeScript execution
- **@types/node** (^20.10.0): Node.js type definitions
- **eslint** (^8.54.0): Code linting
- **@typescript-eslint/*** (^6.13.0): TypeScript ESLint plugins

## 🔧 Configuration Files

### `package.json`
- NPM package configuration
- Scripts: build, start, dev, lint, test
- Dependencies and devDependencies

### `tsconfig.json`
- TypeScript compiler options
- Target: ES2020
- Module: CommonJS
- Strict mode enabled

### `.eslintrc.json`
- ESLint configuration
- TypeScript parser
- Recommended rules

### `ecosystem.config.js`
- PM2 process manager configuration
- Auto-restart settings
- Log file locations
- Memory limits

### `.env.example`
- Template for environment variables
- All configurable options
- Comments and defaults

## 📚 Documentation Files

### `README.md`
- Main project documentation
- Features overview
- Installation guide
- Configuration details
- Usage instructions

### `QUICKSTART.md`
- 5-minute setup guide
- Basic commands
- Quick troubleshooting
- First trade checklist

### `DEPLOYMENT.md`
- VPS deployment guide
- Docker deployment
- Cloud deployment (AWS, GCP, DigitalOcean)
- Production configuration
- Monitoring setup
- Security hardening

### `ADVANCED_STRATEGIES.md`
- Trading strategies
- Optimization techniques
- Risk management
- Performance metrics
- Future enhancements

### `TROUBLESHOOTING.md`
- Common errors and solutions
- Debugging tips
- Performance issues
- Security issues
- Emergency procedures

### `CHANGELOG.md`
- Version history
- Release notes
- Breaking changes
- Upgrade guides

### `PROJECT_STRUCTURE.md`
- This file
- Complete project overview
- File descriptions
- Data flow diagrams

## 🔐 Security Files

### `.gitignore`
- Prevents committing sensitive files
- Excludes: node_modules, dist, .env, logs

### `.env`
- **NEVER COMMIT THIS FILE**
- Contains private key and sensitive config
- Created from .env.example

## 📈 Generated Files/Folders

### `dist/`
- Compiled JavaScript from TypeScript
- Generated by `npm run build`
- Used in production

### `logs/`
- Application logs
- combined.log: All logs
- error.log: Errors only
- Auto-rotated

### `node_modules/`
- NPM dependencies
- Generated by `npm install`
- Not committed to git

## 🎯 Key Interfaces

### `TokenConfig`
```typescript
{
  symbol: string;
  address: string;
  decimals: number;
  isStable?: boolean;
}
```

### `DexConfig`
```typescript
{
  name: string;
  routerAddress: string;
  factoryAddress: string;
  initCodeHash: string;
  fee: number;
}
```

### `PriceQuote`
```typescript
{
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  price: string;
  reserves?: { reserve0: string; reserve1: string };
  timestamp: number;
}
```

### `ArbitrageOpportunity`
```typescript
{
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
```

### `TradeResult`
```typescript
{
  success: boolean;
  txHash?: string;
  amountOut?: string;
  gasUsed?: string;
  error?: string;
}
```

## 🔄 Module Dependencies

```
index.ts
  └─ ArbitrageBot
      ├─ PriceService
      │   └─ ethers.JsonRpcProvider
      ├─ ArbitrageService
      ├─ TradeService
      │   ├─ ethers.Wallet
      │   └─ SafetyService
      └─ MonitorService

All modules use:
  ├─ config (from config/index.ts)
  ├─ logger (from utils/logger.ts)
  └─ helpers (from utils/helpers.ts)
```

---

**Note**: This structure is designed for modularity, maintainability, and scalability. Each module has a single responsibility and can be modified independently.
