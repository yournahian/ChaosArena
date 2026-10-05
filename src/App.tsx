import { useState, useEffect } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useSwitchChain, useReadContract } from 'wagmi'
import { Toaster, toast } from 'sonner'
import { Flame, Landmark, Timer, ExternalLink, Copy, Check, Droplets, Zap, User, ArrowLeft, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { KimaHero } from './components/KimaHero'
import { TechFeaturesRuler } from './components/TechFeaturesRuler'
import { HowTheMagicHappens } from './components/HowTheMagicHappens'
import { ChaosTicker } from './components/ChaosTicker'
import { Tokenomics3D } from './components/Tokenomics3D'
import { ProfileView } from './components/ProfileView'
import { UserManualView } from './components/UserManualView'
import { DareGame } from './components/DareGame'
import { MuseumGame } from './components/MuseumGame'
import { LPWGame } from './components/LPWGame'
import { CHAIN_ID, CHAOS_ARENA, EXPLORER } from './chaosArena'
import { formatUnits } from 'viem'

export type Page = 'home' | 'dare' | 'museum' | 'lpw' | 'profile' | 'manual'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [copied, setCopied] = useState(false)

  const { address, chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const wrongChain = chainId !== undefined && chainId !== CHAIN_ID

  // Arena Telemetry
  const { data: dareCountData } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'dareCount',
    chainId: CHAIN_ID,
  })
  const dareCount = Number((dareCountData as bigint) ?? 0n)

  const { data: museumCountData } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'museumTokenIdCounter',
    chainId: CHAIN_ID,
  })
  const museumCount = Number((museumCountData as bigint) ?? 0n)

  const { data: lpwBalanceData } = useReadContract({
    ...CHAOS_ARENA,
    functionName: 'lpwBalance',
    chainId: CHAIN_ID,
  })
  const lpwBalance = lpwBalanceData ? formatUnits(lpwBalanceData as bigint, 6) : '0'

  const copyContractAddress = () => {
    navigator.clipboard.writeText(CHAOS_ARENA.address)
    setCopied(true)
    toast.success('Contract address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Scroll to top when changing pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  return (
    <div className="min-h-screen relative bg-[#07080c] text-slate-100 tech-grid selection:bg-emerald-500/30 selection:text-emerald-200 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />

      {/* Floating Kima-Style Capsule Header */}
      <div className="fixed top-2 sm:top-4 inset-x-0 z-50 px-2 sm:px-6 pointer-events-none">
        <header className="max-w-[1400px] w-full mx-auto pill-navbar rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto shadow-2xl gap-2 sm:gap-3">
          {/* Brand Wordmark (Navigates to Home) */}
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 text-left"
          >
            <span className="display font-extrabold text-base sm:text-xl tracking-tight text-white hover:text-emerald-300 transition-colors">
              Chaos<span className="text-emerald-400">Arena</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hidden md:inline-block">
              ARC TESTNET
            </span>
          </button>

          {/* Center Floating Navigation for Independent Pages (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 shrink-0">
            <button
              onClick={() => setPage('home')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                page === 'home'
                  ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setPage('dare')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                page === 'dare'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Dares
            </button>
            <button
              onClick={() => setPage('museum')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                page === 'museum'
                  ? 'bg-purple-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Museum
            </button>
            <button
              onClick={() => setPage('lpw')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                page === 'lpw'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Last Person Wins
            </button>
          </nav>

          {/* Right Action Bar (With Profile & Connect Wallet without clipping) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {wrongChain && (
              <button
                onClick={() => switchChain({ chainId: CHAIN_ID })}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-lg animate-pulse shrink-0"
              >
                Switch to Arc
              </button>
            )}

            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/25 transition-all shrink-0"
            >
              <Droplets size={12} />
              Faucet
            </a>

            {/* Wallet & Profile Group */}
            <div className="flex items-center gap-1 bg-black/50 p-0.5 sm:p-1 rounded-full border border-white/10 shrink-0">
              <button
                onClick={() => setPage('profile')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                  page === 'profile'
                    ? 'bg-emerald-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="View your profile, game history & balances"
              >
                <User size={13} className={page === 'profile' ? 'text-slate-950' : 'text-emerald-400'} />
                <span className="hidden sm:inline">Profile</span>
              </button>

              <div className="shrink-0 min-w-max">
                <ConnectKitButton.Custom>
                  {({ isConnected, isConnecting, show, address, ensName }) => (
                    <button
                      onClick={show}
                      className="px-2.5 sm:px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer bg-white hover:bg-slate-200 text-slate-950 shadow-sm flex items-center gap-1 sm:gap-1.5 shrink-0"
                    >
                      {isConnected ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span>{ensName ?? (address ? `${address.slice(0, 4)}…${address.slice(-3)}` : 'Connected')}</span>
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">{isConnecting ? '…' : 'Connect'}</span>
                          <span className="hidden sm:inline">{isConnecting ? 'Connecting…' : 'Connect Wallet'}</span>
                        </>
                      )}
                    </button>
                  )}
                </ConnectKitButton.Custom>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Rendered by Selected Page */}
      <main className="flex-1 w-full pb-16 md:pb-0">
        {/* ========================================================= */}
        {/* PAGE 1: HOME / LANDING PAGE SHOWCASE                      */}
        {/* ========================================================= */}
        {page === 'home' && (
          <div>
            {/* Kima Hero with Direct Round Coins & Energy Streams */}
            <KimaHero
              onEnterArena={p => setPage(p ?? 'dare')}
              dareCount={dareCount}
              museumCount={museumCount}
              lpwBalance={lpwBalance}
            />

            {/* Top Infinite Scrolling Ticker (Zero Side Space) */}
            <div className="border-y border-white/[0.08] bg-[#050609] py-3.5 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono font-medium text-slate-400">
                <span className="text-emerald-400 font-bold">_$CHAOS_ARENA</span>
                <span>•</span>
                <span>ARC TESTNET [CHAIN ID 5042002]</span>
                <span>•</span>
                <span className="text-white">GAS NATIVELY PAID IN USDC</span>
                <span>•</span>
                <span>SUB-SECOND FINALITY</span>
                <span>•</span>
                <span className="text-cyan-400">CONTRACT: {CHAOS_ARENA.address}</span>
                <span>•</span>
                <span>100% NON-CUSTODIAL ESCROW</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">_$CHAOS_ARENA</span>
                <span>•</span>
                <span>ARC TESTNET [CHAIN ID 5042002]</span>
                <span>•</span>
                <span className="text-white">GAS NATIVELY PAID IN USDC</span>
                <span>•</span>
                <span>SUB-SECOND FINALITY</span>
              </div>
            </div>

            {/* Tech Features Ruler Track (01-04) */}
            <TechFeaturesRuler
              onSelectFeature={i => {
                if (i === 1) setPage('dare')
                if (i === 2) setPage('museum')
                if (i === 3) setPage('lpw')
              }}
            />

            {/* How The Magic Happens Interactive Engine */}
            <HowTheMagicHappens />

            {/* FULL-BLEED ZERO-SPACE _$CHAOS AUTO-SCROLLING TICKER */}
            <ChaosTicker />

            {/* 3D Token Ring & Specs Section */}
            <Tokenomics3D onStart={() => setPage('dare')} />

            {/* Arena Game Portals CTA */}
            <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  _ CHOOSE YOUR GAME ENVIRONMENT _
                </span>
                <h2 className="display font-bold text-3xl sm:text-5xl text-white tracking-tight mt-2">
                  Enter The Chaos Arena
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  onClick={() => setPage('dare')}
                  className="p-8 rounded-3xl bg-[#090b10] border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                      <Flame size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-amber-400">PAGE // 01</span>
                      <span className="text-xs font-mono text-slate-400">{dareCount} Dares</span>
                    </div>
                    <h3 className="display font-extrabold text-2xl text-white group-hover:text-amber-300 transition-colors mb-2">
                      Onchain Dare
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lock USDC bounties on daring social tasks. Prove completion onchain and win payouts verified by the jury.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-amber-300">
                    <span>Open Dares Arena</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div
                  onClick={() => setPage('museum')}
                  className="p-8 rounded-3xl bg-[#090b10] border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                      <Landmark size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-purple-400">PAGE // 02</span>
                      <span className="text-xs font-mono text-slate-400">{museumCount} Exhibits</span>
                    </div>
                    <h3 className="display font-extrabold text-2xl text-white group-hover:text-purple-300 transition-colors mb-2">
                      Bad Decisions
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Mint your worst crypto financial blunders as immutable NFTs. 100% of mint fees pool into the Monthly Jackpot!
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-purple-300">
                    <span>Open Museum Page</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div
                  onClick={() => setPage('lpw')}
                  className="p-8 rounded-3xl bg-[#090b10] border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                      <Timer size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">PAGE // 03</span>
                      <span className="text-xs font-mono text-slate-400">{lpwBalance} USDC Pot</span>
                    </div>
                    <h3 className="display font-extrabold text-2xl text-white group-hover:text-cyan-300 transition-colors mb-2">
                      Last Person Wins
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Doomsday countdown clock jackpot. Every deposit resets the timer. The last player remaining sweeps 98% of the pot.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-cyan-300">
                    <span>Open LPW Page</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 2: DEDICATED ONCHAIN DARE PAGE                       */}
        {/* ========================================================= */}
        {page === 'dare' && (
          <div className="pt-28 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPage('home')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Home
              </button>
            </div>
            <DareGame />
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 3: DEDICATED MUSEUM OF BAD DECISIONS PAGE            */}
        {/* ========================================================= */}
        {page === 'museum' && (
          <div className="pt-28 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPage('home')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Home
              </button>
            </div>
            <MuseumGame />
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 4: DEDICATED LAST PERSON WINS PAGE                   */}
        {/* ========================================================= */}
        {page === 'lpw' && (
          <div className="pt-28 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPage('home')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Home
              </button>
            </div>
            <LPWGame />
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 5: DEDICATED USER PROFILE & HISTORY PAGE             */}
        {/* ========================================================= */}
        {page === 'profile' && (
          <div className="pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-4">
              <button
                onClick={() => setPage('home')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Home
              </button>
            </div>
            <ProfileView onNavigate={p => setPage(p)} />
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 6: DEDICATED USER MANUAL PAGE                        */}
        {/* ========================================================= */}
        {page === 'manual' && (
          <div className="pt-28 pb-20">
            <UserManualView onNavigate={p => setPage(p)} />
          </div>
        )}
      </main>

      {/* Technical Minimalist Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050609] py-10 pb-28 md:pb-12 text-xs text-slate-500">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage('home')}
              className="display font-extrabold text-lg tracking-tight text-white hover:text-emerald-300 transition-colors cursor-pointer text-left"
            >
              Chaos<span className="text-emerald-400">Arena</span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-400 text-xs">Arc Testnet Ecosystem</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px]">
            {/* User Manual from docs folder */}
            <button
              onClick={() => setPage('manual')}
              className={`hover:text-emerald-400 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer ${
                page === 'manual'
                  ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15'
              }`}
              title="Read official user manual & protocol rules"
            >
              <BookOpen size={12} className={page === 'manual' ? 'text-slate-950' : 'text-emerald-400'} />
              <span>User Manual</span>
            </button>

            <button
              onClick={copyContractAddress}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5 cursor-pointer"
            >
              <span>Contract: {CHAOS_ARENA.address.slice(0, 8)}…{CHAOS_ARENA.address.slice(-4)}</span>
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
            <a
              href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Explorer <ExternalLink size={11} />
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Circle Faucet
            </a>
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Arc Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation Dock (Only on mobile < md screens) */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-none">
        <nav className="pill-navbar rounded-2xl px-1.5 py-1.5 flex items-center justify-around pointer-events-auto shadow-2xl border border-white/15 bg-[#090b12]/95 backdrop-blur-xl max-w-sm mx-auto">
          <button
            onClick={() => setPage('home')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              page === 'home'
                ? 'text-emerald-400 bg-emerald-500/15 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={17} />
            <span className="text-[10px] font-mono tracking-tight">Home</span>
          </button>
          <button
            onClick={() => setPage('dare')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              page === 'dare'
                ? 'text-amber-400 bg-amber-500/15 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={17} />
            <span className="text-[10px] font-mono tracking-tight">Dares</span>
          </button>
          <button
            onClick={() => setPage('museum')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              page === 'museum'
                ? 'text-purple-400 bg-purple-500/15 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark size={17} />
            <span className="text-[10px] font-mono tracking-tight">Museum</span>
          </button>
          <button
            onClick={() => setPage('lpw')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              page === 'lpw'
                ? 'text-cyan-400 bg-cyan-500/15 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Timer size={17} />
            <span className="text-[10px] font-mono tracking-tight">LPW</span>
          </button>
          <button
            onClick={() => setPage('profile')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              page === 'profile'
                ? 'text-emerald-400 bg-emerald-500/15 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={17} />
            <span className="text-[10px] font-mono tracking-tight">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
