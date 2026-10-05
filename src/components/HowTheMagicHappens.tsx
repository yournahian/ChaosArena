import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Coins, CheckCircle2, User, Trophy, Scale, Lock, RefreshCw } from 'lucide-react'
import { CHAOS_ARENA } from '../chaosArena'

export function HowTheMagicHappens() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [speedMode, setSpeedMode] = useState<'standard' | 'instant'>('instant')

  return (
    <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          _ ESCROW SETTLEMENT ENGINE _
        </span>
        <h2 className="display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mt-3">
          How the magic happens.
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Deterministic non-custodial smart contracts guarantee trustless payouts without middlemen.
        </p>

        {/* Step Toggles */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { id: 1 as const, label: '01 // Deposit' },
            { id: 2 as const, label: '02 // Jury & Timer' },
            { id: 3 as const, label: '03 // Settlement' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                step === s.id
                  ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* The Central Visual Engine (Exact Kima 00:18 - 00:24 Layout) */}
      <div className="relative rounded-3xl bg-[#090b10] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

        {/* Corner Crosshairs */}
        <span className="absolute top-3 left-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute top-3 right-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-3 left-3 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/20">+</span>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Source Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl transition-all border ${
              step >= 1 ? 'bg-slate-950/90 border-emerald-500/40 glow-mint' : 'bg-slate-950/40 border-white/5 opacity-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">SOURCE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Player Wallet</h4>
                  <p className="text-xs text-emerald-300 font-mono">10.00 USDC locked</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Arc Testnet ERC-20 Escrow
              </p>
            </div>

            {/* Validation / Lock Box */}
            <div className={`p-4 rounded-xl border transition-all ${
              step >= 2 ? 'bg-slate-950/90 border-cyan-500/40' : 'bg-slate-950/40 border-white/5 opacity-50'
            }`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                <Lock size={13} />
                <span>Escrow Validation</span>
              </div>
              <p className="text-[11px] text-slate-400">
                USDC held in non-custodial contract: <span className="font-mono text-slate-300">{CHAOS_ARENA.address.slice(0, 8)}…</span>
              </p>
            </div>
          </div>

          {/* Center: Engine Console */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full relative p-6 rounded-2xl bg-[#0c0e16] border-2 border-emerald-500/30 text-center shadow-xl">
              {/* Technical brackets */}
              <div className="absolute top-2 left-3 text-[9px] font-mono text-emerald-400/70">[ ARC KERNEL ]</div>
              <div className="absolute top-2 right-3 text-[9px] font-mono text-emerald-400/70">[ 0x068B…3774 ]</div>

              {/* Speed Mode Interactive Switch (Matches Tx/TxLite in video) */}
              <div className="inline-flex items-center gap-1 p-1 bg-black/60 rounded-full border border-white/10 mb-4 mt-2">
                <button
                  onClick={() => setSpeedMode('instant')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                    speedMode === 'instant' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Sub-Second
                </button>
                <button
                  onClick={() => setSpeedMode('standard')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                    speedMode === 'standard' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Finalized
                </button>
              </div>

              {/* Central Glowing Core */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-400/20 mb-3">
                <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center">
                  <span className="display font-black text-2xl text-white">C</span>
                </div>
              </div>

              <h4 className="display font-bold text-base text-white">
                ChaosCore Engine
              </h4>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                {step === 1 ? '1. Verifying Deposit...' : step === 2 ? '2. Running Jury Consensus...' : '3. Executing Payout!'}
              </p>

              {/* Animated progress indicator */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden border border-white/5">
                <motion.div
                  className="bg-emerald-400 h-full rounded-full"
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Right: Destination Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className={`p-5 rounded-2xl transition-all border ${
              step === 3 ? 'bg-slate-950/90 border-amber-500/40 glow-mint' : 'bg-slate-950/40 border-white/5 opacity-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">DESTINATION</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Winner Address</h4>
                  <p className="text-xs text-amber-300 font-mono">9.80 USDC Disbursed</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                98% to winner • 2% platform fee
              </p>
            </div>

            {/* Finality Badge */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 3 ? 'bg-slate-950/90 border-emerald-500/40' : 'bg-slate-950/40 border-white/5 opacity-50'
            }`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-1">
                <CheckCircle2 size={13} />
                <span>Atomic Onchain Finality</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transaction confirmed directly on Arc with zero slippage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
