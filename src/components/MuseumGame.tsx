import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { toast } from 'sonner'
import { Landmark, Trophy, Sparkles, Skull, Flame, ShieldAlert, Award, Calendar, Quote } from 'lucide-react'
import { CHAOS_ARENA, USDC_ADDRESS, USDC_DECIMALS, CHAIN_ID } from '../chaosArena'
import { Card, SectionTitle, Label, PrimaryBtn, GhostBtn, Textarea, TxLink, Badge, formatAddr } from './shared'

const CONFESSION_PROMPTS = [
  'Sold 100k Doge for pizza in 2014...',
  'Bought a JPEG of a pixelated rock at the absolute peak...',
  'Left my seed phrase on an unencrypted Discord screenshot...',
  'Fat-fingered a 100x leverage market order while half-asleep...',
]

function useMuseumFee() {
  const { data } = useReadContract({ ...CHAOS_ARENA, functionName: 'museumMintFee', chainId: CHAIN_ID })
  return (data as bigint | undefined) ?? 0n
}

function useMuseumCount() {
  const { data } = useReadContract({ ...CHAOS_ARENA, functionName: 'museumTokenIdCounter', chainId: CHAIN_ID })
  return Number((data as bigint | undefined) ?? 0n)
}

function useMuseumEntry(tokenId: number) {
  return useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumEntries',
    args: [BigInt(tokenId)],
    chainId: CHAIN_ID,
  })
}

function useMonthlyPrizePool(monthKey: bigint) {
  const { data } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'monthlyPrizeAccumulated',
    args: [monthKey],
    chainId: CHAIN_ID,
  })
  return (data as bigint | undefined) ?? 0n
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

const currentMonthKey = () => BigInt(Math.floor(Date.now() / 1000 / (30 * 24 * 3600)))

function MintForm() {
  const [decision, setDecision] = useState('')
  const { address } = useAccount()
  const fee = useMuseumFee()
  const allowance = useAllowance()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const feeFormatted = formatUnits(fee, USDC_DECIMALS)
  const needsApproval = allowance < fee

  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CHAOS_ARENA.address, fee],
      chainId: CHAIN_ID,
    })
  }

  const handleMint = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'mintMuseum',
      args: [decision],
      chainId: CHAIN_ID,
    })
  }

  if (isSuccess) {
    toast.success('Your bad decision is now immortalized onchain forever!')
    setDecision('')
  }

  if (!address) {
    return (
      <Card className="mb-6 border-dashed border-purple-500/20 bg-slate-900/40 text-center py-8">
        <ShieldAlert size={36} className="mx-auto text-purple-400 mb-2.5 opacity-80" />
        <h3 className="font-bold text-white text-base">Connect Wallet to Enter the Museum</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Mint your regrettable financial moments as permanent onchain artifacts.
        </p>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-purple-500/30 glow-pink bg-slate-900/90" glow="pink">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Skull size={18} className="text-pink-400" />
            Immortalize a Bad Decision (NFT)
          </h3>
          <p className="text-xs text-slate-400">
            Minted as an immutable onchain record. 100% of the mint fee goes into the Monthly Prize Pool!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/25 px-3 py-1.5 rounded-xl shrink-0">
          <span className="text-[11px] uppercase font-mono text-slate-400">Mint Fee:</span>
          <span className="font-mono font-bold text-sm text-pink-300">
            {feeFormatted || '0.50'} USDC
          </span>
        </div>
      </div>

      {/* Preset Prompts */}
      <div className="mb-3">
        <Label>Need inspiration for your confession?</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {CONFESSION_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDecision(prompt)}
              className="text-xs text-left px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-pink-500/10 hover:border-pink-500/30 text-slate-400 hover:text-pink-300 border border-white/5 transition-all flex items-center gap-1"
            >
              <Sparkles size={11} className="text-amber-400" />
              {prompt.slice(0, 30)}…
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label>Your Confession / Worst Mistake</Label>
        <Textarea
          value={decision}
          onChange={setDecision}
          placeholder="I bought 200 NFTs of an invisible goat in 2021 and lost my life savings..."
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Live Preview Card */}
      {decision.trim() && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-purple-950/40 border border-purple-500/30 relative">
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Quote size={11} /> Live NFT Exhibition Preview
          </div>
          <p className="text-sm italic text-slate-200 leading-relaxed font-serif">
            "{decision}"
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>By: {formatAddr(address)}</span>
            <span>Fee: {feeFormatted} USDC</span>
          </div>
        </div>
      )}

      {hash && <TxLink hash={hash} />}

      <div className="mt-2">
        {needsApproval ? (
          <PrimaryBtn onClick={handleApprove} loading={isPending || confirming} variant="cyan">
            Approve {feeFormatted} USDC for Museum
          </PrimaryBtn>
        ) : (
          <PrimaryBtn
            onClick={handleMint}
            loading={isPending || confirming}
            disabled={!decision.trim()}
            variant="pink"
          >
            <Flame size={16} />
            Mint Confession ({feeFormatted} USDC)
          </PrimaryBtn>
        )}
      </div>

      <p className="text-[11px] mt-2.5 text-center text-slate-500 font-mono">
        Permanent. Onchain on Arc. Cannot be censored or deleted.
      </p>
    </Card>
  )
}

function MonthlyPrize() {
  const monthKey = currentMonthKey()
  const pool = useMonthlyPrizePool(monthKey)
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash })

  const poolFormatted = formatUnits(pool, USDC_DECIMALS)

  const handleSettle = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'settleMuseumMonth',
      args: [monthKey],
      chainId: CHAIN_ID,
    })
  }

  const handleClaim = () => {
    writeContract({
      ...CHAOS_ARENA,
      functionName: 'claimMuseumPrize',
      args: [monthKey],
      chainId: CHAIN_ID,
    })
  }

  return (
    <Card className="mb-8 border-amber-500/30 glow-gold bg-gradient-to-br from-slate-900/90 via-amber-950/20 to-slate-950" glow="gold">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Monthly Winner Jackpot
              </span>
              <Badge color="yellow">Epoch #{monthKey.toString()}</Badge>
            </div>

            <div className="display font-extrabold text-3xl sm:text-4xl text-amber-300 tracking-tight leading-none mt-1">
              {poolFormatted} <span className="text-base font-mono font-bold text-amber-400/80">USDC</span>
            </div>

            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Every confession mint fee funds this pot! The most prolific confessor of the month claims the entire bounty.
            </p>
          </div>
        </div>

        {address && (
          <div className="flex sm:flex-col gap-2 shrink-0">
            <GhostBtn onClick={handleSettle} disabled={isPending || confirming}>
              Settle Epoch
            </GhostBtn>
            <PrimaryBtn onClick={handleClaim} disabled={isPending || confirming} variant="gold">
              <Award size={14} />
              Claim My Prize
            </PrimaryBtn>
          </div>
        )}
      </div>

      {hash && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <TxLink hash={hash} />
        </div>
      )}
    </Card>
  )
}

function EntryCard({ tokenId }: { tokenId: number }) {
  const { data } = useMuseumEntry(tokenId)
  if (!data) return null
  const [minter, decision, timestamp] = data as readonly [`0x${string}`, string, bigint, bigint]
  const date = new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="mb-4 hover:border-purple-500/40 transition-all group bg-slate-900/60">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="mono text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/25">
            EXHIBIT #{tokenId}
          </span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Calendar size={11} /> {date}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
          by {formatAddr(minter)}
        </span>
      </div>

      <div className="relative pl-4 border-l-2 border-purple-500/40 py-1 my-2">
        <p className="text-sm text-slate-100 font-medium leading-relaxed">
          "{decision}"
        </p>
      </div>
    </Card>
  )
}

export function MuseumGame() {
  const count = useMuseumCount()
  const ids = Array.from({ length: Math.min(count, 30) }, (_, i) => count - 1 - i)

  return (
    <div>
      <SectionTitle
        subtitle="Confess your worst crypto blunders to the blockchain. Mint fees pool together for the monthly champion."
        badge="Permanent Exhibition"
      >
        Museum of Bad Decisions
      </SectionTitle>

      <MonthlyPrize />
      <MintForm />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <Landmark size={15} className="text-purple-400" />
          Hall of Shame Exhibits ({count})
        </h3>
      </div>

      {count === 0 && (
        <Card className="text-center py-12 border-dashed border-white/10">
          <Landmark size={36} className="mx-auto text-purple-400 mb-2 opacity-60" />
          <p className="text-base font-semibold text-slate-300">The Museum is currently empty.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Be the first legend to confess a costly mistake and inaugurate Exhibit #0!
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ids.map(id => (
          <EntryCard key={id} tokenId={id} />
        ))}
      </div>
    </div>
  )
}
