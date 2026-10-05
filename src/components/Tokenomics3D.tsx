import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Copy, Check, ExternalLink, ArrowRight, Sparkles } from 'lucide-react'
import { CHAOS_ARENA, EXPLORER } from '../chaosArena'
import { toast } from 'sonner'

export function Tokenomics3D({ onStart }: { onStart: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyContract = () => {
    navigator.clipboard.writeText(CHAOS_ARENA.address)
    setCopied(true)
    toast.success('Contract address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto overflow-hidden">
      {/* Main 3D Stage Card */}
      <div className="relative rounded-3xl bg-[#08090e] border border-white/10 p-6 sm:p-12 shadow-2xl overflow-hidden">
        {/* Corner Crosshairs */}
        <span className="absolute top-3 left-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute top-3 right-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-3 left-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/20">+</span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Model Details */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                PROTOCOL ARCHITECTURE
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                ChaosArena settles games with deterministic smart contract logic on Arc.
                All bounties, prizes, and gas fees utilize native USDC.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/25 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white uppercase">VERIFIED ON ARC</p>
                <p className="text-[10px] text-emerald-400 font-mono">Foundry Testnet Suite</p>
              </div>
            </div>
          </div>

          {/* Center Column: 3D Rotating Coin Ring (Exact Replica of Kima 00:26 3D Ring) */}
          <div className="lg:col-span-4 flex items-center justify-center py-6">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Outer glowing halo */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-2xl" />

              {/* 3D Spinning Ring 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-emerald-400/40 border-t-emerald-300 border-r-transparent"
              />

              {/* 3D Counter-spinning Ring 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border border-cyan-400/30 border-b-cyan-300 border-l-transparent"
              />

              {/* Center Holographic Token Badge */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-tr from-[#0a0d16] via-[#141a29] to-[#0a0d16] border-2 border-emerald-400/50 shadow-2xl shadow-emerald-400/30 flex flex-col items-center justify-center text-center backdrop-blur-md"
              >
                <span className="display font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-cyan-300 leading-none">
                  $CHAOS
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest mt-1">
                  ARC NATIVE
                </span>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Feature Specs List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              [ KEY HIGHLIGHTS ]
            </span>
            {[
              'USDC-Native Gas Abstraction',
              'Sub-Second Transaction Finality',
              'Non-Custodial Escrow Security',
              'Community Quorum Voting',
              '98% LPW Jackpot Distribution',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
                <span className="text-emerald-400 font-bold">-</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Action & Contract Copy */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-7 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Enter the Arena</span>
            <ArrowRight size={14} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyContract}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <span className="text-slate-500">CONTRACT:</span>
              <span className="text-emerald-300">{CHAOS_ARENA.address.slice(0, 10)}…{CHAOS_ARENA.address.slice(-6)}</span>
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            <a
              href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
