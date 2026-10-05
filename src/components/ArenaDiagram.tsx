import { useState } from 'react'
import { Zap, ShieldCheck, Flame, Landmark, Timer, Coins, ArrowRight, CheckCircle2 } from 'lucide-react'
import { CHAOS_ARENA, EXPLORER } from '../chaosArena'

interface ArenaDiagramProps {
  onSelectTab: (tab: 'dare' | 'museum' | 'lpw') => void
  activeTab: 'dare' | 'museum' | 'lpw'
  dareCount: number
  museumCount: number
  lpwBalance: string
}

export function ArenaDiagram({
  onSelectTab,
  activeTab,
  dareCount,
  museumCount,
  lpwBalance,
}: ArenaDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <div className="w-full relative rounded-3xl bg-[#090b10] border border-white/10 p-6 sm:p-10 overflow-hidden shadow-2xl mb-12">
      {/* Background circuit grid dots */}
      <div className="absolute inset-0 tech-grid opacity-60 pointer-events-none" />

      {/* Ambient center radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header inside Diagram */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              _ ARC TESTNET PROTOCOL ARCHITECTURE _
            </span>
          </div>
          <h3 className="display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            How ChaosArena Works.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            100% onchain smart contract escrow powered by Circle USDC on Arc with sub-second finality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chain ID: 5042002</span>
          </div>
          <a
            href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 px-3 py-1.5 rounded-xl border border-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Verified Contract</span>
            <ArrowRight size={12} />
          </a>
        </div>
      </div>

      {/* The Diagram Visual with SVG Circuit Lines */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: User Input & Source */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Node 1: User / Challenger */}
          <div
            onMouseEnter={() => setHoveredNode('user')}
            onMouseLeave={() => setHoveredNode(null)}
            className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-emerald-400/40 transition-all shadow-lg relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                [ 01 • INITIATOR ]
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">USDC Liquidity</h4>
                <p className="text-[11px] text-slate-400 font-mono">ERC-20 • 6 Decimals</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed">
              Users lock bounties, pay NFT confession mint fees, or deposit into the LPW pot.
            </div>
          </div>

          {/* Node 2: Arc Gas Engine */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold mb-1">
              <Zap size={14} /> Arc Native Gas
            </div>
            <p className="text-[11px] leading-relaxed">
              No ETH required. Gas fees are calculated and paid directly using USDC with sub-second block confirmations.
            </p>
          </div>
        </div>

        {/* Center Column: Central Smart Contract Engine */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative p-7 rounded-3xl bg-gradient-to-b from-[#121622] to-[#0a0d14] border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10 text-center group">
            {/* Technical corner brackets */}
            <div className="absolute top-2.5 left-3 text-[10px] font-mono text-emerald-400/60">[ ENGINE ]</div>
            <div className="absolute top-2.5 right-3 text-[10px] font-mono text-emerald-400/60">[ 0x068B…3774 ]</div>
            <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-slate-500">REV: 0.8.28</div>
            <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500">SEC: VERIFIED</div>

            {/* Glowing Logo Emblemn */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-500 p-[2px] mb-4 shadow-lg shadow-emerald-400/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#080a0f] rounded-[14px] flex items-center justify-center">
                <span className="display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                  C
                </span>
              </div>
            </div>

            <h4 className="display font-black text-xl text-white tracking-tight">
              ChaosArena Escrow Core
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic Settlement &amp; Rules
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block">Dares</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{dareCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block">Museum</span>
                <span className="font-mono font-bold text-purple-300 text-sm">{museumCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block">LPW Pot</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{lpwBalance}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Non-Custodial Community Rules</span>
            </div>
          </div>
        </div>

        {/* Right Column: Three Game Outputs */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Game 1: Dares */}
          <div
            onClick={() => onSelectTab('dare')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              activeTab === 'dare'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/15'
                : 'bg-slate-950/70 border-white/10 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Flame size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Onchain Dare</h5>
                  <p className="text-[11px] text-slate-400">Jury-voted proof bounties</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Game 2: Museum */}
          <div
            onClick={() => onSelectTab('museum')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              activeTab === 'museum'
                ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/15'
                : 'bg-slate-950/70 border-white/10 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Landmark size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Bad Decisions</h5>
                  <p className="text-[11px] text-slate-400">NFT Hall of Shame &amp; Jackpot</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Game 3: LPW */}
          <div
            onClick={() => onSelectTab('lpw')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              activeTab === 'lpw'
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/15'
                : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Timer size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Last Person Wins</h5>
                  <p className="text-[11px] text-slate-400">Doomsday countdown pot</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
