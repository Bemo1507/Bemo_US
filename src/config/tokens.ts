export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
  isStable?: boolean;
}

// 30 Token populer di BSC untuk arbitrase
export const TOKENS: Record<string, TokenConfig> = {
  WBNB: {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18
  },
  BUSD: {
    symbol: 'BUSD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    isStable: true
  },
  USDT: {
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    isStable: true
  },
  USDC: {
    symbol: 'USDC',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    isStable: true
  },
  ETH: {
    symbol: 'ETH',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18
  },
  BTCB: {
    symbol: 'BTCB',
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18
  },
  CAKE: {
    symbol: 'CAKE',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18
  },
  ADA: {
    symbol: 'ADA',
    address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
    decimals: 18
  },
  DOT: {
    symbol: 'DOT',
    address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
    decimals: 18
  },
  XRP: {
    symbol: 'XRP',
    address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
    decimals: 18
  },
  DOGE: {
    symbol: 'DOGE',
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    decimals: 8
  },
  MATIC: {
    symbol: 'MATIC',
    address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
    decimals: 18
  },
  LINK: {
    symbol: 'LINK',
    address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
    decimals: 18
  },
  UNI: {
    symbol: 'UNI',
    address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
    decimals: 18
  },
  LTC: {
    symbol: 'LTC',
    address: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94',
    decimals: 18
  },
  DAI: {
    symbol: 'DAI',
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18,
    isStable: true
  },
  ATOM: {
    symbol: 'ATOM',
    address: '0x0Eb3a705fc54725037CC9e008bDede697f62F335',
    decimals: 18
  },
  XVS: {
    symbol: 'XVS',
    address: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',
    decimals: 18
  },
  FIL: {
    symbol: 'FIL',
    address: '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',
    decimals: 18
  },
  TRX: {
    symbol: 'TRX',
    address: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
    decimals: 18
  },
  EOS: {
    symbol: 'EOS',
    address: '0x56b6fB708fC5732DEC1Afc8D8556423A2EDcCbD6',
    decimals: 18
  },
  AAVE: {
    symbol: 'AAVE',
    address: '0xfb6115445Bff7b52FeB98650C87f44907E58f802',
    decimals: 18
  },
  TUSD: {
    symbol: 'TUSD',
    address: '0x14016E85a25aeb13065688cAFB43044C2ef86784',
    decimals: 18,
    isStable: true
  },
  ALPACA: {
    symbol: 'ALPACA',
    address: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
    decimals: 18
  },
  BANANA: {
    symbol: 'BANANA',
    address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    decimals: 18
  },
  BAKE: {
    symbol: 'BAKE',
    address: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
    decimals: 18
  },
  SXP: {
    symbol: 'SXP',
    address: '0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A',
    decimals: 18
  },
  REEF: {
    symbol: 'REEF',
    address: '0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e',
    decimals: 18
  },
  ALICE: {
    symbol: 'ALICE',
    address: '0xAC51066d7bEC65Dc4589368da368b212745d63E8',
    decimals: 6
  },
  TWT: {
    symbol: 'TWT',
    address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
    decimals: 18
  }
};

// Token pairs untuk arbitrase (prioritas tinggi)
export const ARBITRAGE_PAIRS = [
  ['WBNB', 'BUSD'],
  ['WBNB', 'USDT'],
  ['WBNB', 'ETH'],
  ['WBNB', 'BTCB'],
  ['BUSD', 'USDT'],
  ['BUSD', 'USDC'],
  ['ETH', 'BTCB'],
  ['CAKE', 'WBNB'],
  ['CAKE', 'BUSD'],
  ['BANANA', 'WBNB']
];
