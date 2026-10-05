import { useState } from 'react'
import { useAccount, useReadContract, useDisconnect } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { erc20Abi, formatUnits } from 'viem'
import { User, Copy, Check, ExternalLink, Droplets, LogOut, Flame, Landmark, Timer, ShieldAlert, Award, Clock, ArrowUpRight } from 'lucide-react'
import { CHAOS_ARENA, USDC_ADDRESS, USDC_DECIMALS, CHAIN_ID, EXPLORER } from '../chaosArena'
import { Card, SectionTitle, Badge, formatAddr } from './shared'
import { toast } from 'sonner'

export function ProfileView({ onNavigate }: { onNavigate: (page: 'home' | 'dare' | 'museum' | 'lpw' | 'profile') => void }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'dares' | 'museum' | 'history'>('overview')

  // Read User USDC balance
  const { data: usdcBalanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  })
  const usdcBalance = usdcBalanceData ? formatUnits(usdcBalanceData, USDC_DECIMALS) : '0.00'

  // Read User Allowance
  const { data: allowanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address ?? '0x0000000000000000000000000000000000000000', CHAOS_ARENA.address],
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  })
  const allowance = allowanceData ? formatUnits(allowanceData, USDC_DECIMALS) : '0.00'

  // Read LPW Last Depositor
  const { data: lpwLastDepositor } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwLastDepositor',
    chainId: CHAIN_ID,
  })
  const isLpwLeader = Boolean(
    address &&
      lpwLastDepositor &&
      typeof lpwLastDepositor === 'string' &&
      lpwLastDepositor.toLowerCase() === address.toLowerCase()
  )

  // Read Total Dares count
  const { data: dareCountData } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dareCount',
    chainId: CHAIN_ID,
  })
  const dareCount = Number((dareCountData as bigint) ?? 0n)

  // Read Museum Token Count
  const { data: museumCountData } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumTokenIdCounter',
    chainId: CHAIN_ID,
  })
  const museumCount = Number((museumCountData as bigint) ?? 0n)

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Address copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected || !address) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto px-4">
        <Card className="p-10 border-dashed border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <User size={30} />
          </div>
          <h2 className="display font-bold text-2xl text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 mb-6">
            Connect your Arc Testnet wallet in the top right header to view your profile, onchain balances, game participation, and transaction history.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ConnectKitButton />
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              <Droplets size={14} /> Get Testnet USDC
            </a>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
      {/* Profile Header Card */}
      <Card className="mb-8 border-emerald-500/30 glow-mint bg-gradient-to-b from-[#0e121c] to-[#07090e]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-500 p-[2px] shadow-xl shadow-emerald-400/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#080a10] rounded-[14px] flex items-center justify-center text-emerald-400">
                  <User size={32} />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#07090e]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="display font-extrabold text-2xl text-white">
                  {formatAddr(address)}
                </h2>
                <Badge color="green">Arc Testnet</Badge>
                {isLpwLeader && <Badge color="yellow">👑 LPW Leader</Badge>}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-xs font-mono text-slate-400 flex-wrap">
                <button
                  onClick={copyAddress}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/5"
                >
                  <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
                <a
                  href={`${EXPLORER}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  Explorer <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all"
            >
              <Droplets size={13} />
              Faucet
            </a>
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              Disconnect
            </button>
          </div>
        </div>

        {/* Balance & Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              USDC Balance
            </span>
            <div className="display font-extrabold text-2xl sm:text-3xl text-emerald-300">
              {usdcBalance} <span className="text-xs font-mono text-emerald-400/80">USDC</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Native Gas &amp; Play Currency
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Arena Contract Allowance
            </span>
            <div className="display font-extrabold text-2xl sm:text-3xl text-cyan-300">
              {allowance} <span className="text-xs font-mono text-cyan-400/80">USDC</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Pre-approved Escrow Limit
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Arc Finality &amp; Gas
            </span>
            <div className="display font-extrabold text-2xl sm:text-3xl text-amber-300">
              &lt; 1s <span className="text-xs font-mono text-amber-400/80">CONFIRM</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
              Direct Onchain Gas
            </span>
          </div>
        </div>
      </Card>

      {/* Profile Section Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-emerald-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Overview &amp; Games
        </button>
        <button
          onClick={() => setActiveSubTab('dares')}
          className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'dares'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          My Dares
        </button>
        <button
          onClick={() => setActiveSubTab('museum')}
          className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'museum'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          My Museum NFTs
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-cyan-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Transaction History
        </button>
      </div>

      {/* Tab 1: Overview & Jump to Games */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-amber-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-3">
                <Flame size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Onchain Dare Bounties</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Post challenges with locked USDC escrow or complete open community dares for rewards.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dare')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/25 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Dares Page</span>
              <ArrowUpRight size={14} />
            </button>
          </Card>

          <Card className="hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                <Landmark size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Museum of Bad Decisions</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Mint your worst crypto blunders into the Hall of Shame. Mint fees fund the Monthly Jackpot.
              </p>
            </div>
            <button
              onClick={() => onNavigate('museum')}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Museum Page</span>
              <ArrowUpRight size={14} />
            </button>
          </Card>

          <Card className="hover:border-cyan-400/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3">
                <Timer size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Last Person Wins (LPW)</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                High-stakes ticking countdown clock. The last depositor when timer hits 0:00 takes 98% of the pot.
              </p>
            </div>
            <button
              onClick={() => onNavigate('lpw')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to LPW Page</span>
              <ArrowUpRight size={14} />
            </button>
          </Card>
        </div>
      )}

      {/* Tab 2: My Dares */}
      {activeSubTab === 'dares' && (
        <Card className="p-8 text-center">
          <Flame size={32} className="mx-auto text-amber-400 mb-2 opacity-80" />
          <h3 className="font-bold text-white text-base">Your Active Dares &amp; Claims</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Total of {dareCount} dares exist in the arena. You can create a new dare or submit proof on existing ones.
          </p>
          <button
            onClick={() => onNavigate('dare')}
            className="px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-mono text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer"
          >
            Open Dares Arena
          </button>
        </Card>
      )}

      {/* Tab 3: My Museum NFTs */}
      {activeSubTab === 'museum' && (
        <Card className="p-8 text-center">
          <Landmark size={32} className="mx-auto text-purple-400 mb-2 opacity-80" />
          <h3 className="font-bold text-white text-base">Your Immortalized Confessions</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            {museumCount} exhibits minted so far across the community. Mint your mistake to compete for this month's jackpot prize!
          </p>
          <button
            onClick={() => onNavigate('museum')}
            className="px-6 py-2.5 rounded-full bg-purple-500 text-white font-mono text-xs font-bold hover:bg-purple-400 transition-all cursor-pointer"
          >
            Open Museum &amp; Mint
          </button>
        </Card>
      )}

      {/* Tab 4: Transaction & History Logs */}
      {activeSubTab === 'history' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white font-mono">
              Onchain Activity &amp; Logs
            </h3>
            <a
              href={`${EXPLORER}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              Full Arc Explorer History <ExternalLink size={12} />
            </a>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-bold text-white font-mono">Connected to Arc Testnet</p>
                  <p className="text-[10px] text-slate-400 font-mono">Address: {address}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active Session</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <div>
                  <p className="font-bold text-white font-mono">ChaosArena Escrow Contract</p>
                  <p className="text-[10px] text-slate-400 font-mono">Contract: {CHAOS_ARENA.address}</p>
                </div>
              </div>
              <a
                href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-cyan-400 hover:underline"
              >
                Inspect Contract
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <p className="font-bold text-white font-mono">USDC Native Predeploy</p>
                  <p className="text-[10px] text-slate-400 font-mono">Address: {USDC_ADDRESS}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Gas Asset</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
