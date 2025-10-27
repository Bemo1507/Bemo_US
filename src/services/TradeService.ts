import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ROUTER_ABI, ERC20_ABI } from '../contracts/abis';
import { DexConfig } from '../config/dexes';
import { TokenConfig } from '../config/tokens';
import { config } from '../config';
import { logger } from '../utils/logger';
import { getDeadline } from '../utils/helpers';
import { SafetyService } from './SafetyService';

export interface TradeResult {
  success: boolean;
  txHash?: string;
  amountOut?: string;
  gasUsed?: string;
  error?: string;
}

export class TradeService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private safetyService: SafetyService;

  constructor(provider: ethers.JsonRpcProvider, privateKey: string) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(privateKey, provider);
    this.safetyService = new SafetyService(provider);
  }

  async executeArbitrage(
    buyDex: DexConfig,
    sellDex: DexConfig,
    tokenIn: TokenConfig,
    tokenOut: TokenConfig,
    amountIn: string
  ): Promise<TradeResult> {
    try {
      logger.info(`Executing arbitrage: Buy on ${buyDex.name}, Sell on ${sellDex.name}`);
      logger.info(`Pair: ${tokenIn.symbol} -> ${tokenOut.symbol}`);

      // Step 1: Buy on first DEX
      const buyResult = await this.executeTrade(
        buyDex,
        tokenIn,
        tokenOut,
        amountIn
      );

      if (!buyResult.success) {
        return buyResult;
      }

      logger.info(`Buy successful: ${buyResult.amountOut} ${tokenOut.symbol}`);

      // Step 2: Sell on second DEX
      const sellResult = await this.executeTrade(
        sellDex,
        tokenOut,
        tokenIn,
        buyResult.amountOut!
      );

      if (!sellResult.success) {
        logger.error(`Sell failed, but buy succeeded. Manual intervention needed!`);
        return sellResult;
      }

      logger.info(`Sell successful: ${sellResult.amountOut} ${tokenIn.symbol}`);
      logger.info(`Arbitrage completed successfully!`);

      return {
        success: true,
        txHash: sellResult.txHash,
        amountOut: sellResult.amountOut,
        gasUsed: sellResult.gasUsed
      };
    } catch (error) {
      logger.error(`Arbitrage execution failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executeTrade(
    dex: DexConfig,
    tokenIn: TokenConfig,
    tokenOut: TokenConfig,
    amountIn: string
  ): Promise<TradeResult> {
    try {
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

      // Safety checks
      const validation = await this.safetyService.validateTransaction(
        tokenIn.address,
        tokenOut.address,
        amountInWei,
        1n // Minimum 1 wei output
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: `Safety check failed: ${validation.reason}`
        };
      }

      // Check and approve token if needed
      const approvalResult = await this.ensureApproval(
        tokenIn.address,
        dex.routerAddress,
        amountInWei
      );

      if (!approvalResult) {
        return {
          success: false,
          error: 'Token approval failed'
        };
      }

      // Get expected output amount
      const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, this.wallet);
      const path = [tokenIn.address, tokenOut.address];
      const amounts = await router.getAmountsOut(amountInWei, path);
      const expectedAmountOut = amounts[1];

      // Calculate minimum amount out with slippage
      const slippageBN = new BigNumber(config.maxSlippage).dividedBy(100);
      const minAmountOut = new BigNumber(expectedAmountOut.toString())
        .multipliedBy(new BigNumber(1).minus(slippageBN))
        .integerValue(BigNumber.ROUND_DOWN);

      const minAmountOutWei = BigInt(minAmountOut.toString());

      // Get gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice 
        ? (feeData.gasPrice * BigInt(Math.floor(config.gasPriceMultiplier * 100))) / 100n
        : ethers.parseUnits(config.maxGasPriceGwei.toString(), 'gwei');

      // Check if gas price is acceptable
      const maxGasPrice = ethers.parseUnits(config.maxGasPriceGwei.toString(), 'gwei');
      if (gasPrice > maxGasPrice) {
        return {
          success: false,
          error: `Gas price too high: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`
        };
      }

      // Execute swap
      const deadline = getDeadline(300); // 5 minutes
      const tx = await router.swapExactTokensForTokens(
        amountInWei,
        minAmountOutWei,
        path,
        this.wallet.address,
        deadline,
        {
          gasPrice,
          gasLimit: 300000n
        }
      );

      logger.info(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }

      const amountOut = ethers.formatUnits(expectedAmountOut, tokenOut.decimals);
      const gasUsed = receipt.gasUsed.toString();

      return {
        success: true,
        txHash: tx.hash,
        amountOut,
        gasUsed
      };
    } catch (error) {
      logger.error(`Trade execution failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async ensureApproval(
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint
  ): Promise<boolean> {
    try {
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
      const allowance = await token.allowance(this.wallet.address, spenderAddress);

      if (allowance >= amount) {
        return true;
      }

      logger.info(`Approving ${tokenAddress} for ${spenderAddress}`);
      const tx = await token.approve(spenderAddress, ethers.MaxUint256);
      const receipt = await tx.wait();

      return receipt && receipt.status === 1;
    } catch (error) {
      logger.error(`Approval failed: ${error}`);
      return false;
    }
  }

  async getBalance(tokenAddress: string): Promise<string> {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers.formatEther(balance);
      }

      const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await token.balanceOf(this.wallet.address);
      const decimals = await token.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      logger.error(`Error getting balance: ${error}`);
      return '0';
    }
  }
}
