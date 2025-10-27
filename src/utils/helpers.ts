import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

export function formatAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

export function calculatePriceImpact(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
): BigNumber {
  const amountInWithFee = amountIn.multipliedBy(997);
  const numerator = amountInWithFee.multipliedBy(reserveOut);
  const denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);
  const amountOut = numerator.dividedBy(denominator);
  
  const priceWithoutImpact = amountIn.multipliedBy(reserveOut).dividedBy(reserveIn);
  const impact = priceWithoutImpact.minus(amountOut).dividedBy(priceWithoutImpact).multipliedBy(100);
  
  return impact;
}

export function calculateProfit(
  amountIn: BigNumber,
  amountOut: BigNumber,
  gasCost: BigNumber
): { profitAmount: BigNumber; profitPercentage: BigNumber } {
  const profitAmount = amountOut.minus(amountIn).minus(gasCost);
  const profitPercentage = profitAmount.dividedBy(amountIn).multipliedBy(100);
  
  return { profitAmount, profitPercentage };
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getDeadline(seconds: number = 300): number {
  return getCurrentTimestamp() + seconds;
}
