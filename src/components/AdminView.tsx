import { useState, useEffect, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import {
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Landmark,
  Timer,
  Scale,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Award
} from 'lucide-react'
import { CHAOS_ARENA, USDC_ADDRESS, USDC_DECIMALS, CHAIN_ID, EXPLORER } from '../chaosArena'
import { toast } from 'sonner'

const DARE_STATES = ['Open', 'Claimed', 'Settled', 'Cancelled', 'Expired'] as const

const formatAddr = (addr?: string) => {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'None'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function AdminView({ onBack }: { onBack: () => void }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('chaos_arena_admin_auth') === 'true'
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState(false)

  // Last Refreshed Seconds Tracker
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success(`${label} copied to clipboard!`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Update seconds ago timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshedAt) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastRefreshedAt])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const targetPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'chaos2024'
    if (passwordInput === targetPassword) {
      sessionStorage.setItem('chaos_arena_admin_auth', 'true')
      setIsAuthenticated(true)
      setAuthError(false)
      toast.success('Admin session authenticated')
    } else {
      setAuthError(true)
      toast.error('Invalid admin credentials')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('chaos_arena_admin_auth')
    setIsAuthenticated(false)
    setPasswordInput('')
    toast.info('Admin session ended')
  }

  // Current Month Key for Museum Calculations
  const currentMonthKey = useMemo(() => {
    return BigInt(Math.floor(Date.now() / 1000 / (30 * 24 * 3600)))
  }, [])

  // ==========================================
  // WAGMI REAL-TIME CONTRACT READS (10s Poll)
  // ==========================================
  const queryConfig = {
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  }

  // 1. Platform Overview Reads
  const { data: ownerData, refetch: refetchOwner } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'owner',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: pausedData, refetch: refetchPaused } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'paused',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: treasuryData, refetch: refetchTreasury } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'treasury',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: usdcBalanceData, refetch: refetchUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [CHAOS_ARENA.address],
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  // 2. Dare Game Global Reads
  const { data: dareCountData, refetch: refetchDareCount } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dareCount',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: dareBalanceData, refetch: refetchDareBalance } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dareBalance',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  // 3. Museum Game Global Reads
  const { data: museumCountData, refetch: refetchMuseumCount } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumTokenIdCounter',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: museumFeeData, refetch: refetchMuseumFee } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumMintFee',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: museumFeeFinalizedData, refetch: refetchMuseumFeeFinalized } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumFeeFinalized',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: museumPrizePoolData, refetch: refetchMuseumPrizePool } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumPrizePool',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: monthlyTopCountData, refetch: refetchMonthlyTopCount } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'monthlyTopCount',
    args: [currentMonthKey],
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: monthlyTopAddressesData, refetch: refetchMonthlyTopAddresses } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'getMonthlyTopAddresses',
    args: [currentMonthKey],
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: monthlyPrizeAccumulatedData, refetch: refetchMonthlyPrizeAccumulated } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'monthlyPrizeAccumulated',
    args: [currentMonthKey],
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: monthPrizeSettledData, refetch: refetchMonthPrizeSettled } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'monthPrizeSettled',
    args: [currentMonthKey],
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  // 4. Last Person Wins Global Reads
  const { data: lpwBalanceData, refetch: refetchLpwBalance } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwBalance',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: lpwLastDepositorData, refetch: refetchLpwLastDepositor } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwLastDepositor',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: lpwExpiryData, refetch: refetchLpwExpiry } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwExpiry',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: lpwMinDepositData, refetch: refetchLpwMinDeposit } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwMinDeposit',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  const { data: lpwMaxDepositData, refetch: refetchLpwMaxDeposit } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwMaxDeposit',
    chainId: CHAIN_ID,
    query: queryConfig,
  })

  // ==========================================
  // MULTICALL RECURSIVE QUERIES
  // ==========================================
  const totalDares = Number((dareCountData as bigint) ?? 0n)
  const totalMuseum = Number((museumCountData as bigint) ?? 0n)

  // Multicall queries for all dares
  const dareCalls = useMemo(() => {
    const calls: any[] = []
    for (let i = 0; i < totalDares; i++) {
      calls.push({
        ...CHAOS_ARENA,
        functionName: 'dares',
        args: [BigInt(i)],
      })
      calls.push({
        ...CHAOS_ARENA,
        functionName: 'dareVoterPool',
        args: [BigInt(i)],
      })
    }
    return calls
  }, [totalDares])

  const { data: dareMulticallData, refetch: refetchDareMulticall } = useReadContracts({
    contracts: dareCalls,
    query: {
      enabled: totalDares > 0,
      ...queryConfig,
    },
  })

  // Multicall queries for recent 10 Museum entries
  const museumRecentCount = Math.min(10, totalMuseum)
  const museumCalls = useMemo(() => {
    const calls: any[] = []
    for (let i = totalMuseum - 1; i >= Math.max(0, totalMuseum - 10); i--) {
      calls.push({
        ...CHAOS_ARENA,
        functionName: 'museumEntries',
        args: [BigInt(i)],
      })
    }
    return calls
  }, [totalMuseum])

  const { data: museumMulticallData, refetch: refetchMuseumMulticall } = useReadContracts({
    contracts: museumCalls,
    query: {
      enabled: totalMuseum > 0,
      ...queryConfig,
    },
  })

  // Parse Dares data
  const parsedDares = useMemo(() => {
    if (!dareMulticallData || totalDares === 0) return []
    const results = []
    for (let i = 0; i < totalDares; i++) {
      const dareResult = dareMulticallData[i * 2]?.result as any
      const voterPoolResult = (dareMulticallData[i * 2 + 1]?.result as bigint) ?? 0n

      if (dareResult) {
        // [creator, bounty, description, proofDefinition, claimant, proofSubmission, createdAt, claimedAt, voteWindowStart, yesVotes, noVotes, state]
        results.push({
          id: i,
          creator: dareResult[0] as string,
          bounty: dareResult[1] as bigint,
          description: dareResult[2] as string,
          proofDefinition: dareResult[3] as string,
          claimant: dareResult[4] as string,
          proofSubmission: dareResult[5] as string,
          createdAt: dareResult[6] as bigint,
          claimedAt: dareResult[7] as bigint,
          voteWindowStart: dareResult[8] as bigint,
          yesVotes: Number(dareResult[9] as bigint),
          noVotes: Number(dareResult[10] as bigint),
          state: Number(dareResult[11]) as number,
          voterPool: voterPoolResult,
        })
      }
    }
    return results
  }, [dareMulticallData, totalDares])

  // Dare summary state breakdown
  const dareStats = useMemo(() => {
    const counts = { Open: 0, Claimed: 0, Settled: 0, Cancelled: 0, Expired: 0 }
    parsedDares.forEach(d => {
      const stateName = DARE_STATES[d.state] || 'Open'
      if (counts[stateName] !== undefined) {
        counts[stateName]++
      }
    })
    return counts
  }, [parsedDares])

  // Parse Museum entries data
  const parsedMuseumEntries = useMemo(() => {
    if (!museumMulticallData || totalMuseum === 0) return []
    return museumMulticallData
      .map((entry, idx) => {
        const tokenId = totalMuseum - 1 - idx
        const res = entry.result as any
        if (!res) return null
        return {
          tokenId,
          minter: res[0] as string,
          decision: res[1] as string,
          timestamp: res[2] as bigint,
          monthKey: res[3] as bigint,
        }
      })
      .filter(Boolean) as {
        tokenId: number
        minter: string
        decision: string
        timestamp: bigint
        monthKey: bigint
      }[]
  }, [museumMulticallData, totalMuseum])

  // Refresh All Telemetry
  const handleManualRefresh = async () => {
    setLastRefreshedAt(Date.now())
    await Promise.all([
      refetchOwner(),
      refetchPaused(),
      refetchTreasury(),
      refetchUsdcBalance(),
      refetchDareCount(),
      refetchDareBalance(),
      refetchMuseumCount(),
      refetchMuseumFee(),
      refetchMuseumFeeFinalized(),
      refetchMuseumPrizePool(),
      refetchMonthlyTopCount(),
      refetchMonthlyTopAddresses(),
      refetchMonthlyPrizeAccumulated(),
      refetchMonthPrizeSettled(),
      refetchLpwBalance(),
      refetchLpwLastDepositor(),
      refetchLpwExpiry(),
      refetchLpwMinDeposit(),
      refetchLpwMaxDeposit(),
      refetchDareMulticall(),
      refetchMuseumMulticall(),
    ])
    toast.success('Telemetry refetched from Arc Testnet')
  }

  // Financial Invariant Computation
  const dareBal = (dareBalanceData as bigint) ?? 0n
  const museumPool = (museumPrizePoolData as bigint) ?? 0n
  const lpwBal = (lpwBalanceData as bigint) ?? 0n
  const actualUsdc = (usdcBalanceData as bigint) ?? 0n

  const totalTrackedFunds = dareBal + museumPool + lpwBal
  const invariantDifference = actualUsdc - totalTrackedFunds
  const isHealthy = invariantDifference === 0n

  // LPW State Computation
  const lpwExpiryNum = Number((lpwExpiryData as bigint) ?? 0n)
  const [lpwTimeRemaining, setLpwTimeRemaining] = useState<number>(0)

  useEffect(() => {
    const updateLpw = () => {
      const now = Math.floor(Date.now() / 1000)
      setLpwTimeRemaining(Math.max(0, lpwExpiryNum - now))
    }
    updateLpw()
    const id = setInterval(updateLpw, 1000)
    return () => clearInterval(id)
  }, [lpwExpiryNum])

  const lpwStatus = useMemo(() => {
    if (lpwExpiryNum === 0) return { label: 'No Active Game', color: 'slate' }
    if (lpwTimeRemaining > 0) return { label: 'Active (Ticking)', color: 'emerald' }
    return { label: 'Expired (Awaiting Claim)', color: 'amber' }
  }, [lpwExpiryNum, lpwTimeRemaining])

  // ==========================================
  // VIEW 1: AUTHENTICATION LOCK SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#0a0c14] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle grid and glows */}
          <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <Lock size={28} />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
              _ RESTRICTED OPERATIONS _
            </span>
            <h2 className="display font-extrabold text-2xl text-white tracking-tight mt-3">
              ChaosArena Ops Console
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Real-time contract telemetry, game state inspector, and financial invariant audit for Arc Testnet.
            </p>

            <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Admin Passkey
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value)
                      setAuthError(false)
                    }}
                    placeholder="Enter admin password..."
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-mono ${
                      authError
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {authError && (
                  <p className="text-[11px] font-mono text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} /> Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock size={15} />
                <span>Authenticate Session</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center">
              <button
                onClick={onBack}
                className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Return to Public Arena</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED OPS DASHBOARD
  // ==========================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      {/* Top Operations Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <Activity size={12} className="animate-pulse text-emerald-400" />
              LIVE OPS TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-slate-400 border border-white/10 px-2 py-0.5 rounded-full bg-slate-900">
              READ-ONLY MODE
            </span>
          </div>

          <h1 className="display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-1.5">
            Arc Protocol Administration Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Autonomous smart contract telemetry on Arc Testnet [Chain ID {CHAIN_ID}]
          </p>
        </div>

        {/* Action Controls & Refreshed Indicator */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Refreshed: {secondsAgo}s ago</span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 font-mono text-xs font-bold transition-all cursor-pointer"
            title="Force immediate contract refetch"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 font-mono text-xs font-bold transition-all cursor-pointer"
            title="Lock and clear session auth"
          >
            <LogOut size={13} />
            <span>Lock</span>
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-mono text-xs transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Arena</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. FINANCIAL BACKING INVARIANT AUDITOR (TOP PRIORITY)    */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          isHealthy
            ? 'bg-gradient-to-br from-[#06140f] to-[#080d14] border-emerald-500/40 shadow-xl shadow-emerald-500/5'
            : 'bg-gradient-to-br from-[#1c080e] to-[#0f090c] border-rose-500/50 shadow-xl shadow-rose-500/10'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scale size={18} className={isHealthy ? 'text-emerald-400' : 'text-rose-400'} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  CRITICAL FINANCIAL INVARIANT AUDIT
                </span>
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                  isHealthy
                    ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isHealthy ? 'INVARIANT PASSING' : 'INVARIANT MISMATCH'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formula verified onchain: <code className="text-emerald-300 font-mono">dareBalance + museumPrizePool + lpwBalance ≤ actualContractUSDC</code>
              </p>
            </div>

            <div className="text-left lg:text-right">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Backing Variance</span>
              <span className={`display font-mono font-black text-2xl ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                {invariantDifference >= 0n ? '+' : ''}{formatUnits(invariantDifference, USDC_DECIMALS)} USDC
              </span>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Actual USDC in Contract
              </span>
              <div className="font-mono font-extrabold text-xl sm:text-2xl text-white">
                {formatUnits(actualUsdc, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                Total ERC-20 Vault Assets
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Dare Bounties Escrow
              </span>
              <div className="font-mono font-extrabold text-xl sm:text-2xl text-amber-300">
                {formatUnits(dareBal, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Active &amp; Claimed Dares
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Museum Prize Pool
              </span>
              <div className="font-mono font-extrabold text-xl sm:text-2xl text-purple-300">
                {formatUnits(museumPool, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Accumulated Monthly Pot
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                LPW Jackpot Pot
              </span>
              <div className="font-mono font-extrabold text-xl sm:text-2xl text-cyan-300">
                {formatUnits(lpwBal, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Doomsday Clock Balance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. PLATFORM OVERVIEW & GLOBAL CONTROLS                     */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} className="text-emerald-400" />
          <h2 className="display font-bold text-lg text-white">Platform Overview &amp; Infrastructure</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Contract Address */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Contract Address</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                <a
                  href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>{formatAddr(CHAOS_ARENA.address)}</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  onClick={() => copyToClipboard(CHAOS_ARENA.address, 'Contract address')}
                  className="p-1 hover:text-white transition-colors"
                >
                  {copiedText === CHAOS_ARENA.address ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">Arc Testnet 5042002</span>
          </div>

          {/* USDC Balance */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Contract USDC Total</span>
              <div className="font-mono font-extrabold text-lg text-white">
                {formatUnits(actualUsdc, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-2">Gas Token &amp; Escrow</span>
          </div>

          {/* Treasury Address */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Treasury Address</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                <a
                  href={`${EXPLORER}/address/${treasuryData as string}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>{formatAddr(treasuryData as string)}</span>
                  <ExternalLink size={11} />
                </a>
                {Boolean(treasuryData) && (
                  <button
                    onClick={() => copyToClipboard(treasuryData as string, 'Treasury address')}
                    className="p-1 hover:text-emerald-400 transition-colors"
                  >
                    {copiedText === treasuryData ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">Platform Fee Recipient</span>
          </div>

          {/* Owner Address */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Contract Owner</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                <a
                  href={`${EXPLORER}/address/${ownerData as string}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-amber-300 flex items-center gap-1"
                >
                  <span>{formatAddr(ownerData as string)}</span>
                  <ExternalLink size={11} />
                </a>
                {Boolean(ownerData) && (
                  <button
                    onClick={() => copyToClipboard(ownerData as string, 'Owner address')}
                    className="p-1 hover:text-emerald-400 transition-colors"
                  >
                    {copiedText === ownerData ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">Ownable2Step Admin</span>
          </div>

          {/* Emergency Pause Status */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Pause Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${pausedData ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                <span className={`font-mono text-xs font-bold ${pausedData ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {pausedData ? 'PAUSED' : 'UNPAUSED (NORMAL)'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">Pausable Circuit Breaker</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DARE GAME TELEMETRY & FULL TABLE                       */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            <h2 className="display font-bold text-lg text-white">Onchain Dare Protocol Telemetry</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300">
              Total Dares: <strong className="text-white">{totalDares}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Open: {dareStats.Open}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              Claimed: {dareStats.Claimed}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
              Settled: {dareStats.Settled}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/5 text-slate-400">
              Cancelled: {dareStats.Cancelled}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
              Expired: {dareStats.Expired}
            </span>
          </div>
        </div>

        {/* Dares Table */}
        <div className="rounded-2xl bg-[#090b10] border border-white/10 overflow-hidden shadow-xl">
          {parsedDares.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Flame size={32} className="text-amber-400/50 mx-auto mb-2" />
              <p className="font-bold text-white text-sm">No Dares Recorded Onchain Yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once users create dares, real-time creator addresses, bounty escrows, community jury votes, and claimant links will populate here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#050609] text-slate-400 border-b border-white/10 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Bounty</th>
                    <th className="py-3 px-4 max-w-xs">Description</th>
                    <th className="py-3 px-4">Claimant</th>
                    <th className="py-3 px-4">Votes (Y/N)</th>
                    <th className="py-3 px-4">Voter Pool</th>
                    <th className="py-3 px-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedDares.map(dare => {
                    const stateLabel = DARE_STATES[dare.state] || 'Open'
                    const stateColor =
                      stateLabel === 'Open'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : stateLabel === 'Claimed'
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : stateLabel === 'Settled'
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : stateLabel === 'Cancelled'
                        ? 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'

                    return (
                      <tr key={dare.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">#{dare.id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${stateColor}`}>
                            {stateLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`${EXPLORER}/address/${dare.creator}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-emerald-400 underline decoration-slate-600 flex items-center gap-1"
                          >
                            <span>{formatAddr(dare.creator)}</span>
                            <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-300">
                          {formatUnits(dare.bounty, USDC_DECIMALS)} USDC
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-300" title={dare.description}>
                          {dare.description.length > 60 ? `${dare.description.slice(0, 60)}…` : dare.description}
                        </td>
                        <td className="py-3.5 px-4">
                          {dare.claimant && dare.claimant !== '0x0000000000000000000000000000000000000000' ? (
                            <a
                              href={`${EXPLORER}/address/${dare.claimant}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-300 hover:underline flex items-center gap-1"
                            >
                              <span>{formatAddr(dare.claimant)}</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-600">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-400 font-bold">{dare.yesVotes}</span> / <span className="text-rose-400 font-bold">{dare.noVotes}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatUnits(dare.voterPool, USDC_DECIMALS)} USDC
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {dare.createdAt > 0n ? new Date(Number(dare.createdAt) * 1000).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MUSEUM OF BAD DECISIONS TELEMETRY                      */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Landmark size={18} className="text-purple-400" />
          <h2 className="display font-bold text-lg text-white">Museum of Bad Decisions Telemetry</h2>
        </div>

        {/* Museum Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Total Exhibits Minted</span>
            <div className="font-mono font-extrabold text-2xl text-white">{totalMuseum} NFTs</div>
            <span className="text-[10px] font-mono text-purple-400 mt-1 block">ERC-721 CAMUSE Token</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Museum Mint Fee</span>
            <div className="font-mono font-extrabold text-2xl text-purple-300">
              {formatUnits((museumFeeData as bigint) ?? 0n, USDC_DECIMALS)} USDC
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Fee Finalized: {museumFeeFinalizedData ? 'Yes (Immutable)' : 'No (Adjustable)'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Current Month Key</span>
            <div className="font-mono font-extrabold text-2xl text-white">
              #{currentMonthKey.toString()}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Settled: {monthPrizeSettledData ? 'Settled' : 'In Progress'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Month Prize Accumulated</span>
            <div className="font-mono font-extrabold text-2xl text-emerald-400">
              {formatUnits((monthlyPrizeAccumulatedData as bigint) ?? 0n, USDC_DECIMALS)} USDC
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Top Mints This Month: {Number((monthlyTopCountData as bigint) ?? 0n)}
            </span>
          </div>
        </div>

        {/* Current Month Leader Addresses */}
        <div className="p-4 rounded-2xl bg-[#090b10] border border-white/10 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">Month Leaderboard Addresses:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {monthlyTopAddressesData && (monthlyTopAddressesData as string[]).length > 0 ? (
              (monthlyTopAddressesData as string[]).map((addr, idx) => (
                <a
                  key={idx}
                  href={`${EXPLORER}/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300 hover:text-white flex items-center gap-1"
                >
                  <span>{formatAddr(addr)}</span>
                  <ExternalLink size={10} />
                </a>
              ))
            ) : (
              <span className="text-slate-500">No entries submitted this calendar month</span>
            )}
          </div>
        </div>

        {/* Recent Museum Entries Table */}
        <div className="rounded-2xl bg-[#090b10] border border-white/10 overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-[#050609] border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Latest Museum Confessions (Last {museumRecentCount})
            </span>
            <span className="text-slate-500">Auto-polled every 10s</span>
          </div>

          {parsedMuseumEntries.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs font-mono text-slate-500">
              No bad decisions minted to the museum yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/30 text-slate-400 border-b border-white/5 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Token ID</th>
                    <th className="py-2.5 px-4">Minter</th>
                    <th className="py-2.5 px-4">Confession Decision</th>
                    <th className="py-2.5 px-4">Date Minted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedMuseumEntries.map(entry => (
                    <tr key={entry.tokenId} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-purple-300">#{entry.tokenId}</td>
                      <td className="py-3 px-4">
                        <a
                          href={`${EXPLORER}/address/${entry.minter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-purple-400 underline decoration-slate-600 flex items-center gap-1"
                        >
                          <span>{formatAddr(entry.minter)}</span>
                          <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md truncate" title={entry.decision}>
                        {entry.decision.length > 80 ? `${entry.decision.slice(0, 80)}…` : entry.decision}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {entry.timestamp > 0n ? new Date(Number(entry.timestamp) * 1000).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. LAST PERSON WINS (LPW) TELEMETRY                       */}
      {/* ========================================================= */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Timer size={18} className="text-cyan-400" />
          <h2 className="display font-bold text-lg text-white">Last Person Wins (LPW) Telemetry</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Game Status */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Doomsday Clock State</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  lpwStatus.color === 'emerald'
                    ? 'bg-cyan-400 animate-ping'
                    : lpwStatus.color === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-slate-600'
                }`} />
                <span className={`font-mono text-xs font-bold ${
                  lpwStatus.color === 'emerald'
                    ? 'text-cyan-400'
                    : lpwStatus.color === 'amber'
                    ? 'text-amber-300'
                    : 'text-slate-400'
                }`}>
                  {lpwStatus.label}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">5-minute auto-reset timer</span>
          </div>

          {/* Current Pool Balance */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Accumulated Jackpot</span>
              <div className="font-mono font-extrabold text-2xl text-amber-300">
                {formatUnits(lpwBal, USDC_DECIMALS)} <span className="text-xs text-slate-400">USDC</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-2">Winner sweeps 98%</span>
          </div>

          {/* Last Depositor */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Last Depositor Address</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                <a
                  href={`${EXPLORER}/address/${lpwLastDepositorData as string}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>{formatAddr(lpwLastDepositorData as string)}</span>
                  <ExternalLink size={11} />
                </a>
                {Boolean(lpwLastDepositorData && lpwLastDepositorData !== '0x0000000000000000000000000000000000000000') && (
                  <button
                    onClick={() => copyToClipboard(lpwLastDepositorData as string, 'Leader address')}
                    className="p-1 hover:text-cyan-400 transition-colors"
                  >
                    {copiedText === lpwLastDepositorData ? <Check size={12} className="text-cyan-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">King of the Hill</span>
          </div>

          {/* Expiry Timestamp & Countdown */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Expiry Countdown</span>
              <div className="font-mono font-extrabold text-xl text-cyan-300">
                {lpwExpiryNum === 0
                  ? 'IDLE'
                  : lpwTimeRemaining > 0
                  ? `${Math.floor(lpwTimeRemaining / 60)}m ${lpwTimeRemaining % 60}s`
                  : 'EXPIRED'}
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">
              {lpwExpiryNum > 0 ? new Date(lpwExpiryNum * 1000).toLocaleTimeString() : 'Awaiting 1st deposit'}
            </span>
          </div>

          {/* Deposit Limits */}
          <div className="p-4 rounded-2xl bg-[#0a0c14] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Deposit Bounds</span>
              <div className="font-mono font-bold text-xs text-white">
                {formatUnits((lpwMinDepositData as bigint) ?? 0n, USDC_DECIMALS)} - {formatUnits((lpwMaxDepositData as bigint) ?? 0n, USDC_DECIMALS)} USDC
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2">Min / Max deposit per tx</span>
          </div>
        </div>
      </section>
    </div>
  )
}
