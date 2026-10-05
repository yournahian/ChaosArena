# [App Name]

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** - what Arc Studio remembers about building this app. It helps future agents (or humans) understand and extend the project.

---

## What This App Does

[Brief description of what the app does and its primary use case]

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```

## ChaosArena
- Contract: `contracts/ChaosArena.sol`
- Network: Arc Testnet
- Address: `0x068b59e118a2de15e5a00e8e09e9a3d4508a3774`
- Explorer: https://explorer.testnet.arc.io/address/0x068b59e118a2de15e5a00e8e09e9a3d4508a3774
- USDC: `0x3600000000000000000000000000000000000000` (Arc Testnet ERC-20)
- Treasury: `0x5B12Ce46C7194aD57d143bC22847224047b1Ef42` (platform deployer)
- Config: 1 USDC dare minimum, 0.50 USDC museum fee, 0.10–100 USDC LPW range
