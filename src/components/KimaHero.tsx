import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Timer, Landmark, Flame, ArrowRight, Droplets, Sparkles, Coins } from 'lucide-react'
import { CHAOS_ARENA, EXPLORER } from '../chaosArena'

interface KimaHeroProps {
  onEnterArena: (tab?: 'dare' | 'museum' | 'lpw') => void
  dareCount: number
  museumCount: number
  lpwBalance: string
}

export function KimaHero({ onEnterArena, dareCount, museumCount, lpwBalance }: KimaHeroProps) {
  const [activeTab, setActiveTab] = useState<'dare' | 'museum' | 'lpw' | 'usdc'>('dare')

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-8 lg:px-12 w-full max-w-[1500px] mx-auto overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[55rem] bg-emerald-500/[0.04] rounded-full blur-[160px] pointer-events-none" />

      {/* Hero Header Typography */}
      <div className="relative z-20 text-center max-w-4xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px] uppercase tracking-widest mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          _ HIGH-STAKES WEB3 PROTOCOL ON ARC _
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="display font-black text-4xl sm:text-6xl md:text-7xl tracking-tighter text-white leading-[1.08] mb-5"
        >
          Uniting Chaos <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-white">
            &amp; Web3 Capital.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto mb-8"
        >
          An interactive deterministic game arena powered by Circle USDC on Arc.
          Lock real bounties, mint onchain confessions into the Hall of Shame, or steal the ticking doomsday pot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            onClick={() => onEnterArena(activeTab === 'usdc' ? 'dare' : activeTab)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-xl shadow-emerald-400/25 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span>Enter the Arena</span>
            <ArrowRight size={15} />
          </button>

          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-all duration-200 active:scale-95"
          >
            <Droplets size={13} className="text-emerald-400" />
            <span>Get Testnet USDC</span>
          </a>
        </motion.div>
      </div>

      {/* Visual Interactive Canvas (Direct Round Coins, Fluid SVG Curves & Particle Pulses) */}
      <div className="relative z-10 w-full rounded-3xl bg-[#08090f]/90 border border-white/10 p-4 sm:p-8 overflow-hidden shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

        {/* Technical corner crosshairs */}
        <span className="absolute top-4 left-4 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute top-4 right-4 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-4 left-4 text-[10px] font-mono text-white/20">+</span>
        <span className="absolute bottom-4 right-4 text-[10px] font-mono text-white/20">+</span>

        {/* Responsive Canvas Container with 1000x520 aspect ratio */}
        <div className="relative w-full h-[480px] sm:h-[520px] max-w-5xl mx-auto flex items-center justify-center">
          {/* SVG Animated Circuit Energy Beams */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 520"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="beamDare" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="beamUsdc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="beamMuseum" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="beamLpw" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
              </linearGradient>

              {/* Glowing Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Static Paths */}
            <path d="M 220 130 C 360 130, 360 260, 500 260" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
            <path d="M 220 390 C 360 390, 360 260, 500 260" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
            <path d="M 780 130 C 640 130, 640 260, 500 260" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
            <path d="M 780 390 C 640 390, 640 260, 500 260" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />

            {/* Glowing Flowing Energy Streams */}
            {/* Stream 1: Top-Left Onchain Dare -> Center */}
            <path
              d="M 220 130 C 360 130, 360 260, 500 260"
              stroke="url(#beamDare)"
              strokeWidth={activeTab === 'dare' ? '3.5' : '2'}
              strokeDasharray="8 8"
              className="circuit-pulse"
              filter="url(#glow)"
            />

            {/* Stream 2: Bottom-Left USDC Gas -> Center */}
            <path
              d="M 220 390 C 360 390, 360 260, 500 260"
              stroke="url(#beamUsdc)"
              strokeWidth={activeTab === 'usdc' ? '3.5' : '2'}
              strokeDasharray="6 6"
              className="circuit-pulse"
              filter="url(#glow)"
            />

            {/* Stream 3: Top-Right Museum -> Center */}
            <path
              d="M 780 130 C 640 130, 640 260, 500 260"
              stroke="url(#beamMuseum)"
              strokeWidth={activeTab === 'museum' ? '3.5' : '2'}
              strokeDasharray="8 8"
              className="circuit-pulse"
              filter="url(#glow)"
            />

            {/* Stream 4: Bottom-Right LPW -> Center */}
            <path
              d="M 780 390 C 640 390, 640 260, 500 260"
              stroke="url(#beamLpw)"
              strokeWidth={activeTab === 'lpw' ? '3.5' : '2'}
              strokeDasharray="8 8"
              className="circuit-pulse"
              filter="url(#glow)"
            />
          </svg>

          {/* Central Protocol Escrow Core */}
          <div className="absolute z-20 flex flex-col items-center">
            {/* Central Pulsing Halo */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-3 rounded-full bg-emerald-400/20 blur-md pointer-events-none"
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={() => onEnterArena(activeTab === 'usdc' ? 'dare' : activeTab)}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-500 p-[2.5px] shadow-2xl shadow-emerald-400/30 cursor-pointer flex items-center justify-center"
              >
                <div className="w-full h-full bg-[#080a10] rounded-full flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="display font-black text-3xl text-white tracking-tighter">
                    C
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                    ARENA
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/90 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Arc Testnet Engine</span>
            </div>
          </div>

          {/* ROUND ICON 1: Top-Left (⚡ Onchain Dare Round Coin) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 sm:top-12 left-4 sm:left-14 z-20 flex flex-col items-center cursor-pointer group"
            onClick={() => {
              setActiveTab('dare')
              onEnterArena('dare')
            }}
          >
            {/* Glowing Round Coin (No rectangular card) */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-md group-hover:bg-amber-400/40 transition-all pointer-events-none" />
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2.5px] shadow-2xl shadow-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-[#140e04] flex flex-col items-center justify-center text-amber-400">
                  <Flame size={28} className="animate-pulse" />
                </div>
              </div>
            </div>
            {/* Minimalist Info Label Underneath */}
            <div className="mt-2.5 text-center">
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider font-mono">
                Onchain Dare
              </p>
              <p className="text-[11px] font-mono text-amber-400 font-semibold">
                {dareCount} Bounties Active
              </p>
            </div>
          </motion.div>

          {/* ROUND ICON 2: Bottom-Left (💵 Circle USDC Native Round Coin) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 sm:bottom-10 left-4 sm:left-14 z-20 flex flex-col items-center cursor-pointer group"
            onClick={() => {
              setActiveTab('usdc')
              window.open('https://faucet.circle.com', '_blank')
            }}
          >
            {/* Glowing Round Coin */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-emerald-400/20 blur-md group-hover:bg-emerald-400/40 transition-all pointer-events-none" />
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-500 p-[2.5px] shadow-2xl shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-[#051510] flex flex-col items-center justify-center text-emerald-400">
                  <Coins size={26} />
                </div>
              </div>
            </div>
            {/* Minimalist Info Label Underneath */}
            <div className="mt-2 text-center">
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider font-mono">
                Circle USDC
              </p>
              <p className="text-[11px] font-mono text-emerald-400 font-semibold">
                Native Gas Token
              </p>
            </div>
          </motion.div>

          {/* ROUND ICON 3: Top-Right (🏛 Museum of Bad Decisions Round Coin) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-10 sm:top-12 right-4 sm:right-14 z-20 flex flex-col items-center cursor-pointer group"
            onClick={() => {
              setActiveTab('museum')
              onEnterArena('museum')
            }}
          >
            {/* Glowing Round Coin */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-purple-500/20 blur-md group-hover:bg-purple-500/40 transition-all pointer-events-none" />
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-pink-500 p-[2.5px] shadow-2xl shadow-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-[#13061e] flex flex-col items-center justify-center text-purple-300">
                  <Landmark size={28} />
                </div>
              </div>
            </div>
            {/* Minimalist Info Label Underneath */}
            <div className="mt-2.5 text-center">
              <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors uppercase tracking-wider font-mono">
                Bad Decisions
              </p>
              <p className="text-[11px] font-mono text-purple-400 font-semibold">
                {museumCount} NFTs Minted
              </p>
            </div>
          </motion.div>

          {/* ROUND ICON 4: Bottom-Right (⏱ Last Person Wins Round Coin) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute bottom-8 sm:bottom-10 right-4 sm:right-14 z-20 flex flex-col items-center cursor-pointer group"
            onClick={() => {
              setActiveTab('lpw')
              onEnterArena('lpw')
            }}
          >
            {/* Glowing Round Coin */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-md group-hover:bg-cyan-400/40 transition-all pointer-events-none" />
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-[2.5px] shadow-2xl shadow-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-[#04111d] flex flex-col items-center justify-center text-cyan-300">
                  <Timer size={28} className="animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>
            </div>
            {/* Minimalist Info Label Underneath */}
            <div className="mt-2.5 text-center">
              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono">
                Last Person Wins
              </p>
              <p className="text-[11px] font-mono text-cyan-400 font-semibold">
                {lpwBalance} USDC Pot
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
