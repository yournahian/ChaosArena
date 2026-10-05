import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi, formatUnits, parseUnits } from 'viem'
import { toast } from 'sonner'
import { Timer, Trophy, Zap, AlertTriangle, Crown, ShieldAlert, Sparkles, Flame, Clock } from 'lucide-react'
import { CHAOS_ARENA, USDC_ADDRESS, USDC_DECIMALS, CHAIN_ID } from '../chaosArena'
import { Card, SectionTitle, Label, PrimaryBtn, GhostBtn, Input, TxLink, Badge, formatAddr } from './shared'

function useLPWState() {
  const { data: expiry, refetch: refetchExpiry } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwExpiry',
    chainId: CHAIN_ID,
    query: { refetchInterval: 3000 },
  })
  const { data: last } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwLastDepositor',
    chainId: CHAIN_ID,
    query: { refetchInterval: 3000 },
  })
  const { data: balance } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwBalance',
    chainId: CHAIN_ID,
    query: { refetchInterval: 3000 },
  })
  const { data: minDep } = useReadContract({ ...CHAOS_ARENA, functionName: 'lpwMinDeposit', chainId: CHAIN_ID })
  const { data: maxDep } = useReadContract({ ...CHAOS_ARENA, functionName: 'lpwMaxDeposit', chainId: CHAIN_ID })

  return {
    expiry: (expiry as bigint | undefined) ?? 0n,
    lastDepositor: (last as `0x${string}` | undefined) ?? '0x0000000000000000000000000000000000000000',
    balance: (balance as bigint | undefined) ?? 0n,
    minDeposit: (minDep as bigint | undefined) ?? 100000n,
    maxDeposit: (maxDep as bigint | undefined) ?? 100000000n,
    refetchExpiry,
  }
}

function useAllowance() {
  const { address } = useAccount()
  const { data } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address ?? '0x0000000000000000000000000000000000000000', CHAOS_ARENA.address],
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  })
  return (data as bigint) ?? 0n
}

function Countdown({ expiry, onTick }: { expiry: bigint; onTick: (remaining: number) => void }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000)
      const r = Math.max(0, Number(expiry) - now)
      setRemaining(r)
      onTick(r)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiry, onTick])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  if (expiry === 0n) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold mb-3">
          <Zap size={14} /> ARENA IDLE
        </div>
        <p className="display font-extrabold text-4xl text-slate-300">Ready for Launch</p>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
          Make the initial deposit below to ignite the countdown clock and start the jackpot!
        </p>
      </div>
    )
  }

  if (remaining === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold mb-2">
          <AlertTriangle size={14} className="animate-bounce" /> TIME EXPIRED
        </div>
        <p className="display font-extrabold text-5xl text-rose-500 tracking-tight glow-pink">
          00:00
        </p>
        <p className="text-sm font-bold text-amber-300 mt-2">
          The clock ran out! The last depositor takes the bounty pot.
        </p>
      </div>
    )
  }

  // Dynamic urgency visual styling
  const isUrgent = remaining < 60
  const isWarning = remaining < 180

  return (
    <div className="text-center py-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Timer
          size={16}
          className={isUrgent ? 'text-rose-500 animate-spin' : isWarning ? 'text-amber-400' : 'text-cyan-400'}
        />
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
          {isUrgent ? 'CRITICAL DETONATION COUNTDOWN' : 'TIME REMAINING TO RESET'}
        </span>
      </div>

      <div className="relative inline-block">
        <p
          className={`display font-black text-6xl sm:text-7xl tabular-nums tracking-tighter leading-none transition-colors ${
            isUrgent
              ? 'text-rose-500 animate-pulse'
              : isWarning
              ? 'text-amber-300'
              : 'text-cyan-300'
          }`}
          style={{
            textShadow: isUrgent
              ? '0 0 35px rgba(244,63,94,0.6)'
              : isWarning
              ? '0 0 30px rgba(251,191,36,0.4)'
              : '0 0 30px rgba(0,242,254,0.4)',
          }}
        >
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      </div>

      {isUrgent && (
        <p className="text-xs font-mono font-bold text-rose-400 mt-2 animate-bounce">
          ⚡ UNDER 60 SECONDS! ANY DEPOSIT STEALS THE LEAD!
        </p>
      )}
    </div>
  )
}

export function LPWGame() {
  const [amount, setAmount] = useState('0.5')
  const [remaining, setRemaining] = useState(0)
  const { address } = useAccount()
  const { expiry, lastDepositor, balance, minDeposit, maxDeposit } = useLPWState()
  const allowance = useAllowance()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const amountRaw = (() => {
    try {
      return parseUnits(amount || '0', USDC_DECIMALS)
    } catch {
      return 0n
    }
  })()

  const needsApproval = allowance < amountRaw
  const gameExpired = expiry > 0n && remaining === 0
  const isWinner = address && lastDepositor.toLowerCase() === address.toLowerCase()
  const hasDepositor = lastDepositor !== '0x0000000000000000000000000000000000000000'

  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CHAOS_ARENA.address, amountRaw],
      chainId: CHAIN_ID,
    })
  }

  const handleDeposit = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'depositLPW',
      args: [amountRaw],
      chainId: CHAIN_ID,
    })
  }

  const handleClaim = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'claimLastWins',
      chainId: CHAIN_ID,
    })
  }

  if (isSuccess) toast.success('Transaction confirmed on Arc!')

  const minFmt = formatUnits(minDeposit, USDC_DECIMALS)
  const maxFmt = formatUnits(maxDeposit, USDC_DECIMALS)
  const poolFmt = formatUnits(balance, USDC_DECIMALS)
  const payoutFmt = (parseFloat(poolFmt || '0') * 0.98).toFixed(2)

  return (
    <div>
      <SectionTitle
        subtitle="Every deposit extends the doomsday clock. When the clock hits 0:00, the last depositor sweeps 98% of the accumulated prize pool."
        badge="High Stakes Time-Bomb"
      >
        Last Person Wins (LPW)
      </SectionTitle>

      {/* Main Jackpot & Countdown Board */}
      <Card
        className="mb-8 border-cyan-500/30 glow-cyan bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 relative overflow-hidden"
        glow="cyan"
      >
        <Countdown expiry={expiry} onTick={setRemaining} />

        {/* Live Arena Metrics */}
        <div className="border-t border-white/10 pt-5 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              Current Prize Pool
            </span>
            <div className="display font-extrabold text-3xl sm:text-4xl text-amber-300 tracking-tight leading-none">
              {poolFmt} <span className="text-base font-mono text-amber-400/80">USDC</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              Winner takes 98% (approx {payoutFmt} USDC)
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              {hasDepositor ? 'Current King of the Hill' : 'Leader Status'}
            </span>

            {hasDepositor ? (
              <div>
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-amber-400 shrink-0" />
                  <span className="font-mono text-sm font-bold text-white truncate">
                    {formatAddr(lastDepositor)}
                  </span>
                  {isWinner && <Badge color="green">YOU</Badge>}
                </div>

                {isWinner && !gameExpired && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    👑 You are currently in line to win the entire pot!
                  </p>
                )}
                {!isWinner && !gameExpired && (
                  <p className="text-xs text-slate-400 mt-1">
                    Deposit to dethrone them and claim the lead!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-mono">No leader yet — be the first!</p>
            )}
          </div>
        </div>
      </Card>

      {/* Action Command Console */}
      {address ? (
        <Card className="border-white/10 bg-slate-900/90">
          {gameExpired ? (
            <div className="text-center py-4">
              {isWinner ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <h3 className="display font-extrabold text-2xl text-amber-300">
                      VICTORY! YOU WON THE ARENA POT!
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      You were the final depositor before the timer expired. Claim your prize below:
                    </p>
                  </div>
                  <div className="w-full max-w-md mt-2">
                    <PrimaryBtn onClick={handleClaim} loading={isPending || confirming} variant="gold">
                      <Sparkles size={16} />
                      Claim {payoutFmt} USDC Pot
                    </PrimaryBtn>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-slate-300">
                    Game ended. Winning depositor: <span className="font-mono font-bold text-amber-300">{formatAddr(lastDepositor)}</span>
                  </p>
                  <p className="text-xs text-slate-500">Anyone can trigger settlement to disburse the jackpot.</p>
                  <div className="w-full max-w-sm mt-2">
                    <GhostBtn onClick={handleClaim} disabled={isPending || confirming}>
                      Trigger Pool Settlement
                    </GhostBtn>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Flame size={16} className="text-amber-400" />
                    Deposit &amp; Reset the Clock
                  </h3>
                  <p className="text-xs text-slate-400">
                    Resets the countdown timer and crowns you as the new leader
                  </p>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  Range: {minFmt} - {maxFmt} USDC
                </div>
              </div>

              {/* Quick Increment Chips */}
              <div>
                <Label>Quick deposit amount:</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['0.1', '0.5', '1.0', '5.0'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                        amount === val
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                          : 'bg-white/[0.04] text-slate-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      +{val} USDC
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Custom Deposit Amount (USDC)</Label>
                <Input
                  value={amount}
                  onChange={setAmount}
                  placeholder="0.50"
                  type="number"
                  suffix="USDC"
                />
              </div>

              {hash && <TxLink hash={hash} />}

              <div className="pt-2">
                {needsApproval ? (
                  <PrimaryBtn onClick={handleApprove} loading={isPending || confirming} variant="cyan">
                    Approve {amount || '0'} USDC for LPW Contract
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn
                    onClick={handleDeposit}
                    loading={isPending || confirming}
                    disabled={amountRaw < minDeposit || amountRaw > maxDeposit}
                    variant="pink"
                  >
                    <Clock size={16} />
                    Deposit {amount || '0'} USDC &amp; Reset Doomsday Clock
                  </PrimaryBtn>
                )}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-8 border-dashed border-cyan-500/20 bg-slate-900/40">
          <ShieldAlert size={36} className="mx-auto text-cyan-400 mb-2 opacity-80" />
          <h3 className="font-bold text-white text-base">Connect Wallet to Enter Last Person Wins</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Deposit testnet USDC on Arc to take the lead. If nobody tops you before 0:00, you win!
          </p>
        </Card>
      )}
    </div>
  )
}
