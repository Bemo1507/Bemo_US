export interface DexConfig {
  name: string;
  routerAddress: string;
  factoryAddress: string;
  initCodeHash: string;
  fee: number; // in basis points (e.g., 25 = 0.25%)
}

// 5 DEX populer di BSC
export const DEXES: Record<string, DexConfig> = {
  PANCAKESWAP_V2: {
    name: 'PancakeSwap V2',
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    initCodeHash: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    fee: 25 // 0.25%
  },
  APESWAP: {
    name: 'ApeSwap',
    routerAddress: '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7',
    factoryAddress: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
    initCodeHash: '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b',
    fee: 20 // 0.20%
  },
  BISWAP: {
    name: 'Biswap',
    routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
    factoryAddress: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
    initCodeHash: '0xfea293c909d87cd4153593f077b76bb7e94340200f4ee84211ae8e4f9bd7ffdf',
    fee: 10 // 0.10%
  },
  BABYSWAP: {
    name: 'BabySwap',
    routerAddress: '0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd',
    factoryAddress: '0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da',
    initCodeHash: '0x48c8bec5512d397a5d512fbb7d83d515e7b6d91e9838730bd1aa1b16575da7f5',
    fee: 10 // 0.10%
  },
  MDEX: {
    name: 'MDEX',
    routerAddress: '0x7DAe51BD3E3376B8c7c4900E9107f12Be3AF1bA8',
    factoryAddress: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
    initCodeHash: '0x0d994d996174b05cfc7bed897dc1b20b4c458fc8d64fe98bc78b3c64a6b4d093',
    fee: 30 // 0.30%
  }
};

export const DEX_LIST = Object.keys(DEXES);
