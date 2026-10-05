import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi, parseUnits, formatUnits } from 'viem'
import { toast } from 'sonner'
import { Plus, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles, AlertCircle, ShieldAlert, Award, ArrowRight } from 'lucide-react'
import { CHAOS_ARENA, USDC_ADDRESS, USDC_DECIMALS, CHAIN_ID } from '../chaosArena'
import { Card, SectionTitle, Label, PrimaryBtn, GhostBtn, Input, Textarea, TxLink, Badge, formatAddr } from './shared'

const DARE_STATES = ['Open', 'Claimed', 'Settled', 'Cancelled', 'Expired'] as const

const SAMPLE_DARES = [
  { desc: 'Eat a whole raw lemon on video without making a face', proof: 'Post raw unedited video link with timestamp' },
  { desc: 'Do 50 consecutive pushups live on Twitter Spaces', proof: 'Provide Twitter/X space replay or recording link' },
  { desc: 'Deploy a custom smart contract on Arc Testnet within 2 minutes', proof: 'Tx hash on Arc explorer created within challenge timeframe' },
]

function useDareCount() {
  const { data } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dareCount',
    chainId: CHAIN_ID,
  })
  return Number((data as bigint) ?? 0n)
}

function useDare(id: number) {
  return useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dares',
    args: [BigInt(id)],
    chainId: CHAIN_ID,
    query: { refetchInterval: 10_000 },
  })
}

function useUsdcAllowance() {
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

// ---- Create Dare Studio ----
function CreateDare({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [bounty, setBounty] = useState('1')
  const [desc, setDesc] = useState('')
  const [proof, setProof] = useState('')
  const { address } = useAccount()
  const allowance = useUsdcAllowance()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const bountyRaw = parseUnits(bounty || '0', USDC_DECIMALS)
  const needsApproval = allowance < bountyRaw

  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CHAOS_ARENA.address, bountyRaw],
      chainId: CHAIN_ID,
    })
  }

  const handleCreate = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'createDare',
      args: [bountyRaw, desc, proof],
      chainId: CHAIN_ID,
    })
  }

  if (isSuccess) {
    toast.success('Dare published to the Arena!')
    onCreated()
  }

  const applyPreset = (item: { desc: string; proof: string }) => {
    setDesc(item.desc)
    setProof(item.proof)
  }

  if (!address) {
    return (
      <Card className="mb-6 border-dashed border-cyan-500/20 bg-slate-900/40 text-center py-8">
        <ShieldAlert size={36} className="mx-auto text-cyan-400 mb-2.5 opacity-80" />
        <h3 className="font-bold text-white text-base">Connect Your Wallet to Post or Claim Dares</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Lock real testnet USDC bounties on Arc. All dares are verified by community votes.
        </p>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-cyan-500/30 glow-cyan bg-slate-900/90">
      <button
        className="w-full flex items-center justify-between group"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <span className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              Broadcast a New Onchain Dare
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Min 1.00 USDC
              </span>
            </span>
            <p className="text-xs text-slate-400">Lock bounty funds in the smart contract escrow</p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4">
          {/* Preset Inspirations */}
          <div>
            <Label>Need Inspiration? Pick a preset:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SAMPLE_DARES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(sample)}
                  className="text-xs text-left px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-cyan-500/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 border border-white/5 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  {sample.desc.slice(0, 32)}…
                </button>
              ))}
            </div>
          </div>

          {/* Bounty Selector */}
          <div>
            <Label>Bounty Amount (USDC)</Label>
            <div className="flex items-center gap-2 mb-2">
              {['1', '5', '10', '25', '50'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBounty(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    bounty === val
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                      : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  ${val} USDC
                </button>
              ))}
            </div>
            <Input
              value={bounty}
              onChange={setBounty}
              placeholder="1.00"
              type="number"
              suffix="USDC"
            />
          </div>

          <div>
            <Label>The Dare Description</Label>
            <Textarea
              value={desc}
              onChange={setDesc}
              placeholder="Challenge someone to perform a wild or impressive feat..."
              rows={2}
              maxLength={500}
            />
          </div>

          <div>
            <Label>Proof Requirements</Label>
            <Textarea
              value={proof}
              onChange={setProof}
              placeholder="What evidence is required? e.g. 'Must tweet an unedited 60s video with #ArcChaosArena'..."
              rows={2}
              maxLength={500}
            />
          </div>

          {hash && <TxLink hash={hash} />}

          <div className="pt-2">
            {needsApproval ? (
              <PrimaryBtn
                onClick={handleApprove}
                loading={isPending || confirming}
                variant="cyan"
              >
                Approve {bounty || '1'} USDC for Dare Contract
              </PrimaryBtn>
            ) : (
              <PrimaryBtn
                onClick={handleCreate}
                loading={isPending || confirming}
                disabled={!desc || !proof || parseFloat(bounty) < 1}
                variant="gold"
              >
                <Award size={16} />
                Lock {bounty || '1'} USDC &amp; Post Dare
              </PrimaryBtn>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

const MODULE_NOW_SEC = Math.floor(performance.timeOrigin / 1000 + performance.now() / 1000)

// ---- Single Dare Card ----
function DareRow({ id }: { id: number }) {
  const [expanded, setExpanded] = useState(false)
  const [claimProof, setClaimProof] = useState('')
  const { data: dare } = useDare(id)
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash })

  if (!dare) return null

  const [creator, bounty, description, proofDef, claimant, proofSub, , voteWindowStart, yesVotes, noVotes, state] = dare as readonly [
    `0x${string}`, bigint, string, string, `0x${string}`, string, bigint, bigint, bigint, bigint, number
  ]

  const stateLabel = DARE_STATES[state] ?? 'Unknown'
  const stateColor: 'blue' | 'yellow' | 'green' | 'red' =
    state === 0 ? 'blue' : state === 1 ? 'yellow' : state === 2 ? 'green' : 'red'

  const bountyFormatted = formatUnits(bounty, USDC_DECIMALS)
  const votingOpen = state === 1 && (voteWindowStart === 0n || MODULE_NOW_SEC <= Number(voteWindowStart) + 86400)

  const yesCount = Number(yesVotes)
  const noCount = Number(noVotes)
  const totalVotes = yesCount + noCount
  const yesPct = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 50

  const handleClaim = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'submitClaim',
      args: [BigInt(id), claimProof],
      chainId: CHAIN_ID,
    })
  }

  const handleVote = (yes: boolean) => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'voteOnClaim',
      args: [BigInt(id), yes],
      chainId: CHAIN_ID,
    })
  }

  const handleSettle = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'settleDare',
      args: [BigInt(id)],
      chainId: CHAIN_ID,
    })
  }

  const handleCancel = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'cancelDare',
      args: [BigInt(id)],
      chainId: CHAIN_ID,
    })
  }

  const handleExpire = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'expireDare',
      args: [BigInt(id)],
      chainId: CHAIN_ID,
    })
  }

  const handleClaimVoterReward = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'claimVoterReward',
      args: [BigInt(id)],
      chainId: CHAIN_ID,
    })
  }

  return (
    <Card
      className="mb-4 transition-all hover:border-cyan-500/30 group"
      glow={state === 0 ? 'cyan' : state === 1 ? 'gold' : undefined}
    >
      <div className="w-full text-left cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="mono text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                DARE #{id}
              </span>
              <Badge color={stateColor}>{stateLabel}</Badge>
              {state === 1 && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded animate-pulse">
                  ⚡ VOTING ACTIVE
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
              {description}
            </h3>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>Creator: <span className="font-mono text-slate-300">{formatAddr(creator)}</span></span>
              {claimant !== '0x0000000000000000000000000000000000000000' && (
                <span>• Claimant: <span className="font-mono text-amber-300">{formatAddr(claimant)}</span></span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 shrink-0">
            <div className="text-left sm:text-right">
              <div className="display font-extrabold text-2xl text-amber-300 tracking-tight leading-none">
                {bountyFormatted} <span className="text-xs font-mono font-semibold text-amber-400/80">USDC</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Guaranteed Escrow</span>
            </div>
            <div className="mt-2 text-xs text-cyan-400 flex items-center gap-1 font-semibold">
              <span>{expanded ? 'Collapse' : 'Details & Actions'}</span>
              <ChevronDown size={14} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <Label>Required Proof Specification</Label>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{proofDef}</p>
          </div>

          {state === 1 && claimant !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-amber-500/[0.04] border border-amber-500/20 p-4 rounded-xl">
              <Label>Claim Submission by {formatAddr(claimant)}</Label>
              <p className="text-sm text-amber-200 font-mono mt-1 break-all bg-black/30 p-2.5 rounded-lg border border-white/5">
                {proofSub}
              </p>

              {/* Vote Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-bold">YES: {yesCount} votes ({yesPct}%)</span>
                  <span className="text-rose-400 font-bold">NO: {noCount} votes ({100 - yesPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${yesPct}%` }} className="bg-emerald-500 h-full transition-all" />
                  <div style={{ width: `${100 - yesPct}%` }} className="bg-rose-500 h-full transition-all" />
                </div>
              </div>
            </div>
          )}

          {hash && <TxLink hash={hash} />}

          {/* Action 1: Submit Claim if Open */}
          {state === 0 && address && address.toLowerCase() !== creator.toLowerCase() && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-cyan-400" />
                <span className="text-sm font-bold text-white">Have you completed this dare? Claim the bounty:</span>
              </div>
              <Textarea
                value={claimProof}
                onChange={setClaimProof}
                placeholder="Paste proof link (YouTube, Twitter/X post, IPFS URL, or photo link)..."
                rows={2}
              />
              <PrimaryBtn
                onClick={handleClaim}
                loading={isPending || confirming}
                disabled={!claimProof}
                variant="cyan"
              >
                Submit Verification Proof &amp; Claim {bountyFormatted} USDC
              </PrimaryBtn>
            </div>
          )}

          {/* Action 2: Community Vote */}
          {votingOpen && address && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <Label>Community Jury: Is the submitted proof valid?</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleVote(true)}
                  disabled={isPending || confirming}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 active:scale-95"
                >
                  <ThumbsUp size={16} /> YES (Valid Proof)
                </button>
                <button
                  type="button"
                  onClick={() => handleVote(false)}
                  disabled={isPending || confirming}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 active:scale-95"
                >
                  <ThumbsDown size={16} /> NO (Fake / Invalid)
                </button>
              </div>
            </div>
          )}

          {/* Action 3: Settle */}
          {state === 1 && address && (
            <GhostBtn onClick={handleSettle} disabled={isPending || confirming}>
              Settle Dare Outcome (Tally Votes &amp; Payout)
            </GhostBtn>
          )}

          {/* Action 4: Creator Actions */}
          {state === 0 && address?.toLowerCase() === creator.toLowerCase() && (
            <div className="flex gap-2">
              <GhostBtn onClick={handleCancel} disabled={isPending || confirming}>
                Cancel Dare &amp; Reclaim {bountyFormatted} USDC
              </GhostBtn>
              <GhostBtn onClick={handleExpire} disabled={isPending || confirming}>
                Expire (After 30 Days)
              </GhostBtn>
            </div>
          )}

          {/* Action 5: Voter Reward */}
          {state === 2 && address && (
            <PrimaryBtn onClick={handleClaimVoterReward} disabled={isPending || confirming} variant="emerald">
              Claim Jury Voter Reward
            </PrimaryBtn>
          )}
        </div>
      )}
    </Card>
  )
}

// ---- Main Dare Component ----
export function DareGame() {
  const count = useDareCount()
  const [refresh, setRefresh] = useState(0)
  const ids = Array.from({ length: count }, (_, i) => count - 1 - i)

  return (
    <div>
      <SectionTitle
        subtitle="Post daring bounties, prove completion onchain, and let the community jury decide the payout."
        badge="Trustless Escrow"
      >
        Onchain Dare Bounty Board
      </SectionTitle>

      <CreateDare onCreated={() => setRefresh(r => r + 1)} key={refresh} />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
          Live Bounties in the Arena ({count})
        </h3>
      </div>

      {count === 0 && (
        <Card className="text-center py-12 border-dashed border-white/10">
          <p className="text-base font-semibold text-slate-300">No active dares in the arena yet.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Be the pioneer! Post the very first onchain dare above and test the bravery of the Arc community.
          </p>
        </Card>
      )}

      {ids.map(id => (
        <DareRow key={id} id={id} />
      ))}
    </div>
  )
}
