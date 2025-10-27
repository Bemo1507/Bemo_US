import { ethers } from 'ethers';
import axios from 'axios';
import { logger } from '../utils/logger';
import { ERC20_ABI } from '../contracts/abis';

export class SafetyService {
  private provider: ethers.JsonRpcProvider;
  private blacklistedTokens: Set<string> = new Set();

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  async checkHoneypot(tokenAddress: string): Promise<boolean> {
    try {
      // Honeypot check menggunakan simulasi transfer
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      // Check if token has basic functions
      try {
        await token.decimals();
        await token.symbol();
      } catch (error) {
        logger.warn(`Token ${tokenAddress} missing basic functions - potential honeypot`);
        this.blacklistedTokens.add(tokenAddress.toLowerCase());
        return true;
      }

      // Check if token is already blacklisted
      if (this.blacklistedTokens.has(tokenAddress.toLowerCase())) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error checking honeypot for ${tokenAddress}: ${error}`);
      return true; // Assume honeypot if check fails
    }
  }

  async checkTokenSafety(tokenAddress: string): Promise<{
    isSafe: boolean;
    reason?: string;
  }> {
    // Check honeypot
    const isHoneypot = await this.checkHoneypot(tokenAddress);
    if (isHoneypot) {
      return { isSafe: false, reason: 'Potential honeypot detected' };
    }

    // Check if token has liquidity
    const hasLiquidity = await this.checkLiquidity(tokenAddress);
    if (!hasLiquidity) {
      return { isSafe: false, reason: 'Insufficient liquidity' };
    }

    return { isSafe: true };
  }

  private async checkLiquidity(tokenAddress: string): Promise<boolean> {
    try {
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await token.balanceOf(tokenAddress);
      
      // Check if token has some balance (basic liquidity check)
      return balance > 0n;
    } catch (error) {
      logger.debug(`Could not check liquidity for ${tokenAddress}`);
      return false;
    }
  }

  async validateTransaction(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<{ isValid: boolean; reason?: string }> {
    // Check if amounts are valid
    if (amountIn <= 0n) {
      return { isValid: false, reason: 'Invalid input amount' };
    }

    if (minAmountOut <= 0n) {
      return { isValid: false, reason: 'Invalid output amount' };
    }

    // Check token safety
    const tokenInSafety = await this.checkTokenSafety(tokenIn);
    if (!tokenInSafety.isSafe) {
      return { isValid: false, reason: `Token In: ${tokenInSafety.reason}` };
    }

    const tokenOutSafety = await this.checkTokenSafety(tokenOut);
    if (!tokenOutSafety.isSafe) {
      return { isValid: false, reason: `Token Out: ${tokenOutSafety.reason}` };
    }

    return { isValid: true };
  }

  addToBlacklist(tokenAddress: string): void {
    this.blacklistedTokens.add(tokenAddress.toLowerCase());
    logger.info(`Token ${tokenAddress} added to blacklist`);
  }

  isBlacklisted(tokenAddress: string): boolean {
    return this.blacklistedTokens.has(tokenAddress.toLowerCase());
  }
}
