/**
 * ChaosArena contract config
 * Deployed on Arc Testnet: 0x068b59e118a2de15e5a00e8e09e9a3d4508a3774
 */

import { getUsdc, requireChain } from '@/onchain-facts'
import artifact from '../contracts/contract-metadata/ChaosArena.json'

export const CHAIN_ID = 5042002 // Arc Testnet

export const CHAOS_ARENA = {
  address: '0x068b59e118a2de15e5a00e8e09e9a3d4508a3774' as `0x${string}`,
  abi: artifact.abi,
  chainId: CHAIN_ID,
} as const

const usdcFact = getUsdc(CHAIN_ID)!
export const USDC_ADDRESS = usdcFact.address as `0x${string}`
export const USDC_DECIMALS = usdcFact.decimals

export const ARC_CHAIN = requireChain(CHAIN_ID)

export const EXPLORER = ARC_CHAIN.explorerBase
