import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Landmark, Timer, Zap, CheckCircle2, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    id: '01',
    title: 'Chain-native USDC Gas & Sub-Second Finality',
    subtitle: 'Built on Arc Testnet where USDC is the native gas token. No separate ETH or native coin required.',
    icon: Zap,
    metric: '< 1s Block Time',
    tag: 'ARC L1 SPEED',
  },
  {
    id: '02',
    title: 'Decentralized Social Proof & Community Jury',
    subtitle: 'Dares are locked in smart contract escrow. Claimants submit proof and the community jury settles payouts.',
    icon: Flame,
    metric: '100% Escrow Escrowed',
    tag: 'SOCIAL CONSENSUS',
  },
  {
    id: '03',
    title: 'Permanent NFT Hall of Shame & Monthly Pot',
    subtitle: 'Confess your worst crypto mistakes. Mint fees accumulate in a monthly jackpot claimed by the champion confessor.',
    icon: Landmark,
    metric: '100% Fee Redistribution',
    tag: 'IMMUTABLE MEMORY',
  },
  {
    id: '04',
    title: 'Doomsday Clock Game Theory (LPW)',
    subtitle: 'Every deposit resets the timer. The last player remaining when the clock strikes 0:00 sweeps 98% of the pot.',
    icon: Timer,
    metric: '98% Winner Take All',
    tag: 'HIGH-STAKES POT',
  },
]

export function TechFeaturesRuler({ onSelectFeature }: { onSelectFeature: (index: number) => void }) {
  const [selected, setSelected] = useState(0)
  const current = FEATURES[selected]
  const Icon = current.icon

  return (
    <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
      <div className="mb-10">
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          _ NEXT-GEN BLOCKCHAIN INFRASTRUCTURE _
        </span>
        <h2 className="display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mt-3">
          Arena tech. Built on Arc.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Feature Selector (Exact Kima 00:11-00:17 Style) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {FEATURES.map((feat, idx) => {
            const isSelected = selected === idx
            return (
              <div
                key={feat.id}
                onClick={() => {
                  setSelected(idx)
                  onSelectFeature(idx)
                }}
                className={`p-5 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900/90 border-emerald-400/50 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {feat.id} / 04
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {feat.tag}
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {feat.title}
                </h3>
                {isSelected && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-slate-300 mt-2 leading-relaxed"
                  >
                    {feat.subtitle}
                  </motion.p>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Column: Visual High-Tech Circuit Node Diagram */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl bg-[#090b10] border border-white/10 p-8 shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
            <span className="absolute top-3 left-3 text-[10px] font-mono text-white/20">+</span>
            <span className="absolute top-3 right-3 text-[10px] font-mono text-white/20">+</span>
            <span className="absolute bottom-3 left-3 text-[10px] font-mono text-white/20">+</span>
            <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/20">+</span>

            {/* Top Node Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                  NODE {current.id} ACTIVE
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">{current.metric}</span>
            </div>

            {/* Central Animated Node Graphic */}
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <motion.div
                key={current.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-400 to-cyan-400 p-[2px] shadow-2xl shadow-emerald-400/20 mb-4"
              >
                <div className="w-full h-full bg-[#08090e] rounded-[22px] flex items-center justify-center text-emerald-400">
                  <Icon size={40} />
                </div>
              </motion.div>

              <h4 className="display font-bold text-xl text-white">
                {current.title}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {current.subtitle}
              </p>
            </div>

            {/* Bottom Circuit Status */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>SECURITY: DETERMINISTIC</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Arc Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
