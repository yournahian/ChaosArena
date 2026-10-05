import { useState } from 'react'
import { BookOpen, ShieldCheck, Flame, Landmark, Timer, HelpCircle, ArrowLeft, ArrowUpRight, Copy, Check, ExternalLink, ChevronRight, FileText, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { Card, TechBadge } from './shared'
import { CHAOS_ARENA, EXPLORER } from '../chaosArena'
import { toast } from 'sonner'

export function UserManualView({
  onNavigate,
}: {
  onNavigate: (page: 'home' | 'dare' | 'museum' | 'lpw' | 'profile' | 'manual') => void
}) {
  const [activeSection, setActiveSection] = useState<'before-you-start' | 'game-1' | 'game-2' | 'game-3' | 'general-notes' | 'common-questions' | 'security'>('before-you-start')
  const [copiedRpc, setCopiedRpc] = useState(false)
  const [copiedContract, setCopiedContract] = useState(false)

  const copyRpc = () => {
    navigator.clipboard.writeText('https://rpc.testnet.arc.io')
    setCopiedRpc(true)
    toast.success('RPC URL copied to clipboard!')
    setTimeout(() => setCopiedRpc(false), 2000)
  }

  const copyContract = () => {
    navigator.clipboard.writeText(CHAOS_ARENA.address)
    setCopiedContract(true)
    toast.success('Contract address copied!')
    setTimeout(() => setCopiedContract(false), 2000)
  }

  return (
    <div className="py-8 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              ChaosArena — <span className="text-emerald-400">User Manual</span>
            </h1>
            <TechBadge color="mint">OFFICIAL MANUAL</TechBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            <strong>ChaosArena</strong> is an onchain game platform built on Arc Testnet. It combines three games into one contract. Every action is a real blockchain transaction. Every outcome is enforced by code, not by a platform.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            USDC is the only currency. On Arc, USDC is also the gas token — so one balance covers both gameplay and transaction fees.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyContract}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Contract Address</span>
            {copiedContract ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <a
            href={`${EXPLORER}/address/${CHAOS_ARENA.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 transition-all"
          >
            <span>Arc Explorer</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Main Grid: Sticky Sidebar + Full Complete Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 sticky top-24 flex flex-col gap-1.5 p-3 rounded-2xl bg-[#090b10] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 py-1 font-bold">
            MANUAL SECTIONS
          </span>
          {[
            { id: 'before-you-start', label: '1. Before You Start', icon: BookOpen },
            { id: 'game-1', label: '2. Game 1: Onchain Dare', icon: Flame },
            { id: 'game-2', label: '3. Game 2: Museum', icon: Landmark },
            { id: 'game-3', label: '4. Game 3: Last Person Wins', icon: Timer },
            { id: 'general-notes', label: '5. General Notes', icon: Info },
            { id: 'common-questions', label: '6. Common Questions', icon: HelpCircle },
            { id: 'security', label: '7. Security Notes', icon: ShieldCheck },
          ].map(sec => {
            const Icon = sec.icon
            const isActive = activeSection === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id as any)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  <span>{sec.label}</span>
                </div>
                <ChevronRight size={12} className={isActive ? 'opacity-100' : 'opacity-30'} />
              </button>
            )
          })}
        </aside>

        {/* Content Column: Complete Unabridged Text */}
        <main className="lg:col-span-9 flex flex-col gap-10">
          {/* ========================================================= */}
          {/* SECTION 1: BEFORE YOU START                               */}
          {/* ========================================================= */}
          {activeSection === 'before-you-start' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="before-you-start">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">SECTION 1</span>
                <h2 className="display font-bold text-2xl text-white">Before You Start</h2>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h3 className="font-bold text-base text-white mb-1">1. Get a wallet</h3>
                  <p className="text-slate-400">
                    You need a browser wallet that supports custom EVM chains. MetaMask works. Any injected wallet (Rabby, Frame, Coinbase Wallet) works too.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">2. Add Arc Testnet to your wallet</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 mb-2">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 border-b border-white/10">Field</th>
                          <th className="py-2.5 px-4 border-b border-white/10">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Network name</td>
                          <td className="py-2.5 px-4 font-bold text-white">Arc Testnet</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">RPC URL</td>
                          <td className="py-2.5 px-4 flex items-center justify-between">
                            <code>https://rpc.testnet.arc.io</code>
                            <button
                              onClick={copyRpc}
                              className="hover:text-emerald-400 cursor-pointer ml-2 p-1 rounded bg-white/5 hover:bg-white/10"
                              title="Copy RPC"
                            >
                              {copiedRpc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Chain ID</td>
                          <td className="py-2.5 px-4 text-emerald-300 font-bold">5042002</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Currency symbol</td>
                          <td className="py-2.5 px-4 font-bold text-cyan-300">USDC</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Explorer</td>
                          <td className="py-2.5 px-4">
                            <a
                              href="https://explorer.testnet.arc.io"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              https://explorer.testnet.arc.io <ExternalLink size={10} />
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400">
                    Most wallets let you add a custom network in <em>Settings → Networks → Add Network</em>.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">3. Get test USDC</h3>
                  <p className="text-slate-400 mb-2">
                    Click <strong>Get test USDC</strong> in the Arc Studio sidebar or use the header <strong>Faucet</strong> link. It drips test USDC directly to your connected wallet on Arc Testnet. No external faucet needed.
                  </p>
                  <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg font-mono">
                    ⚠️ Test USDC has no real value. You cannot transfer it to mainnet.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">4. Connect your wallet</h3>
                  <p className="text-slate-400">
                    Click <strong>Connect Wallet</strong> in the top-right corner of ChaosArena. Select your wallet. Approve the connection. The app will show your address and USDC balance once connected.
                  </p>
                  <p className="text-slate-400 mt-1">
                    If you are on the wrong network, your wallet will ask to switch. Approve it.
                  </p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveSection('game-1')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 2. Game 1: Onchain Dare</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: GAME 1 — ONCHAIN DARE                          */}
          {/* ========================================================= */}
          {activeSection === 'game-1' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="game-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 block mb-1">THE THREE GAMES // GAME 1</span>
                  <h2 className="display font-bold text-2xl text-white">Game 1 — Onchain Dare</h2>
                </div>
                <button
                  onClick={() => onNavigate('dare')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>Go to Dares Arena</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h3 className="font-bold text-base text-white mb-1">What it is</h3>
                  <p className="text-slate-400">
                    You lock a USDC bounty and attach a dare to it. Anyone who believes they completed the dare submits proof. The community votes. If YES wins, the claimant collects the bounty. If NO wins, you get your money back.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to post a dare</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                    <li>Click the <strong>Dare</strong> tab.</li>
                    <li>Click <strong>Post a Dare</strong>.</li>
                    <li>
                      Fill in three fields:
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                        <li><strong>Dare</strong> — what you are challenging someone to do. Keep it specific.</li>
                        <li><strong>What counts as proof</strong> — this is the most important field. Write exactly what proof you will accept. Example: <em>"A publicly posted video of you eating a full raw onion without cutting it. Posted on a public social account you own."</em></li>
                        <li><strong>Bounty</strong> — how much USDC to lock. Minimum 1 USDC.</li>
                      </ul>
                    </li>
                    <li>Click <strong>Lock Bounty &amp; Post Dare</strong>.</li>
                    <li>Approve the USDC spend in your wallet (first time only per session).</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    The dare is now live. It appears in the dare list for anyone to see and claim.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    You can cancel a dare and reclaim your bounty at any time <strong>before someone submits a claim</strong>, as long as the dare has not expired (30-day limit).
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to claim a dare</h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                    <li>Browse the dare list. Find one you can do.</li>
                    <li>Read the proof definition carefully. The creator wrote exactly what they will accept.</li>
                    <li>Do the dare. Get your proof ready (a URL, a link, a written description — whatever the proof definition requires).</li>
                    <li>Click <strong>Claim</strong> on the dare.</li>
                    <li>Paste your proof into the field.</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    Your wallet address is now the claimant. You cannot change it. Only one claim per dare is accepted — first come, first served.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Once your claim is submitted, the dare moves to "Claimed" state. The 24-hour voting window does not start until the first vote is cast.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How voting works</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                    <li>Any wallet holding at least <strong>0.10 USDC</strong> on Arc can vote.</li>
                    <li>One vote per wallet per dare.</li>
                    <li>Votes are free — no USDC is transferred to vote. The balance check is just a spam filter.</li>
                    <li>The voting window is <strong>24 hours, starting from the moment the first vote is cast</strong> — not from when the claim was submitted. If nobody votes for days, the window has not started yet.</li>
                    <li>Vote YES if you think the proof satisfies the proof definition. Vote NO if it does not.</li>
                    <li>There is no appeal. The numbers are the law.</li>
                    <li>The proof definition is plain text with no onchain enforcement. The contract only counts votes — it cannot verify whether the proof is real. Social pressure is the only enforcement.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">Settlement</h3>
                  <p className="text-slate-400 mb-2">
                    After the 24-hour voting window closes, anyone can call <strong>Settle</strong>. The contract checks the totals:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 mb-2">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 border-b border-white/10">Result</th>
                          <th className="py-2.5 px-4 border-b border-white/10">What happens</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-emerald-400">YES votes &gt; NO votes</td>
                          <td className="py-2.5 px-4">95% of bounty to claimant, 3% split among YES voters, 2% to platform treasury</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-rose-400">NO votes ≥ YES votes (including tie)</td>
                          <td className="py-2.5 px-4">100% bounty returned to dare creator, no fee</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Zero votes after 7 days</td>
                          <td className="py-2.5 px-4">Treated as tie, full refund to creator</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">Claiming your voter reward</h3>
                  <p className="text-slate-400 mb-2">
                    If you voted YES and the dare passed, you earned a share of the 3% voter pool.
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>Find the settled dare in the list.</li>
                    <li>Click <strong>Claim Voter Reward</strong>.</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    The reward is split equally among all YES voters. It is not automatically sent — you must claim it yourself.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">Dare expiry</h3>
                  <p className="text-slate-400">
                    A dare with no claim submitted after <strong>30 days</strong> can be expired by anyone — the creator, or any other wallet. Nothing happens automatically. Someone must call <strong>Expire Dare</strong> to trigger the refund. Once called, the full bounty returns to the creator with no fee.
                  </p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSection('before-you-start')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Previous: 1. Before You Start</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('game-2')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 3. Game 2: Museum</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: GAME 2 — MUSEUM OF BAD DECISIONS               */}
          {/* ========================================================= */}
          {activeSection === 'game-2' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="game-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-400 block mb-1">THE THREE GAMES // GAME 2</span>
                  <h2 className="display font-bold text-2xl text-white">Game 2 — Museum of Bad Decisions</h2>
                </div>
                <button
                  onClick={() => onNavigate('museum')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>Go to Museum Page</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h3 className="font-bold text-base text-white mb-1">What it is</h3>
                  <p className="text-slate-400">
                    Pay 0.50 USDC to mint an ERC-721 NFT containing your worst financial decision. It is written into the blockchain forever. You cannot edit or delete it. The museum grows over time. Every 30 days, whoever has minted the most entries that month wins the monthly prize pool.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to mint a bad decision</h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                    <li>Click the <strong>Museum</strong> tab.</li>
                    <li>Read the current prize pool and this month's leader board.</li>
                    <li>Click <strong>Add My Bad Decision</strong>.</li>
                    <li>Write your worst financial decision in the text field. Maximum 500 characters. Be specific — vague entries are less fun.</li>
                    <li>Click <strong>Mint to Museum (0.50 USDC)</strong>.</li>
                    <li>Approve the USDC spend (first time only per session).</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    Your NFT is minted. It appears in the museum list with your wallet address (truncated), the decision text, and the timestamp.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    The NFT is real. It is in your wallet. You can transfer it. It will appear in any NFT viewer that supports Arc Testnet.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">The monthly prize</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                    <li>49% of every mint fee goes into the monthly prize pool.</li>
                    <li>The contract divides time into fixed 30-day windows. Everyone minting during the same 30-day window competes together. The window boundaries are fixed — they do not reset from the moment you first mint.</li>
                    <li>Whoever submits the most entries in that 30-day window wins.</li>
                    <li>If two or more wallets are tied for first place, the prize is split equally among all tied wallets.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to claim the monthly prize</h3>
                  <p className="text-slate-400 mb-2">After the 30-day window ends:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>Go to the <strong>Museum</strong> tab.</li>
                    <li>Click <strong>Settle This Month</strong> (anyone can call this once the month is over).</li>
                    <li>If you are a winner, click <strong>Claim Prize</strong>.</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    If you are one of multiple winners, your share is the total pool divided by the number of tied winners.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">Fee breakdown</h3>
                  <p className="text-xs font-mono text-slate-400 mb-2">Per mint of 0.50 USDC:</p>
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 mb-2">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 border-b border-white/10">Destination</th>
                          <th className="py-2.5 px-4 border-b border-white/10">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="py-2.5 px-4 text-purple-300 font-bold">Monthly prize pool</td>
                          <td className="py-2.5 px-4 font-bold text-white">49% (0.245 USDC)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-slate-400">Platform treasury</td>
                          <td className="py-2.5 px-4">51% (0.255 USDC)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400">
                    The treasury amount is split internally as 2% platform fee + 49% direct revenue, but both go to the same treasury address in one transfer. As a user you just pay 0.50 USDC and 49% of it goes toward the prize pool.
                  </p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSection('game-1')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Previous: 2. Game 1: Onchain Dare</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('game-3')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 4. Game 3: Last Person Wins</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: GAME 3 — LAST PERSON WINS                      */}
          {/* ========================================================= */}
          {activeSection === 'game-3' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="game-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">THE THREE GAMES // GAME 3</span>
                  <h2 className="display font-bold text-2xl text-white">Game 3 — Last Person Wins</h2>
                </div>
                <button
                  onClick={() => onNavigate('lpw')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>Go to LPW Page</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h3 className="font-bold text-base text-white mb-1">What it is</h3>
                  <p className="text-slate-400">
                    A pool of USDC with a countdown timer. Every deposit resets the timer. Whoever deposits last — the moment the timer hits zero — wins the entire pool minus a 2% platform fee. Pure chaos.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to deposit</h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                    <li>Click the <strong>Last Person Wins</strong> tab.</li>
                    <li>Watch the countdown. Watch the pool size. Watch who the current last depositor is.</li>
                    <li>Enter a deposit amount. Minimum 0.10 USDC. Maximum 100 USDC per transaction.</li>
                    <li>Click <strong>Deposit &amp; Reset Timer</strong>.</li>
                    <li>Approve the USDC spend (first time only per session).</li>
                    <li>Confirm the transaction.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    The timer resets. You are now the last depositor. If nobody else deposits before the timer hits zero, you win.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    There is no limit on how many times you can deposit. Each deposit resets the timer.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-2">How to claim the pool</h3>
                  <p className="text-slate-400 mb-2">When the timer hits zero:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                    <li>The countdown shows <strong>EXPIRED</strong>.</li>
                    <li>If you are the last depositor, a <strong>Claim Winnings</strong> button appears.</li>
                    <li>Click it and confirm the transaction.</li>
                    <li>You receive 98% of the total pool. 2% goes to the platform treasury.</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-2">
                    The claim function is permissionless — anyone can call it, but the USDC always goes to the last depositor's wallet regardless of who triggers the transaction. You do not need to be the last depositor to call it. But only the last depositor receives the funds.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">What happens if nobody claims</h3>
                  <p className="text-slate-400">
                    If the pool sits unclaimed for 30 days after expiry, the platform owner can reset the pool and send the balance to the treasury as a safety valve. This is a last resort and is not expected to happen during normal play.
                  </p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSection('game-2')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Previous: 3. Game 2: Museum</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('general-notes')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 5. General Notes</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 5: GENERAL NOTES                                  */}
          {/* ========================================================= */}
          {activeSection === 'general-notes' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="general-notes">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">SECTION 5</span>
                <h2 className="display font-bold text-2xl text-white">General Notes</h2>
              </div>

              <div className="flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h3 className="font-bold text-base text-white mb-2">Transaction states</h3>
                  <p className="text-slate-400 mb-2">Every action goes through the same states:</p>
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 mb-2">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 border-b border-white/10">State</th>
                          <th className="py-2.5 px-4 border-b border-white/10">What you see</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-white">Idle</td>
                          <td className="py-2.5 px-4">Button active</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-amber-300">Waiting for wallet</td>
                          <td className="py-2.5 px-4">"Confirm in wallet..." — check your wallet extension</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-cyan-300">Confirming</td>
                          <td className="py-2.5 px-4">"Waiting for confirmation..." — transaction is on chain</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-emerald-400">Success</td>
                          <td className="py-2.5 px-4">Action confirmed, state refreshes</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-rose-400">Error</td>
                          <td className="py-2.5 px-4">Error message shown, your input is preserved</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400">
                    Arc Testnet confirms in under 15 seconds in most cases.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">Approvals</h3>
                  <p className="text-slate-400">
                    The first time you interact with each game in a session, your wallet will ask you to approve USDC spending. This is a standard ERC-20 approval. You approve once and all subsequent transactions in that session do not ask again. If you revoke approval in your wallet, you will need to approve again.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">Reading your USDC balance</h3>
                  <p className="text-slate-400">
                    The balance shown in the app is your ERC-20 USDC balance on Arc Testnet. On Arc, USDC and the gas token are the same asset, so you do not need a separate ETH balance for gas.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">Explorer links</h3>
                  <p className="text-slate-400">
                    Every settled transaction links to the Arc Testnet explorer at <a href="https://explorer.testnet.arc.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://explorer.testnet.arc.io</a>. You can verify every payout, every vote, every mint, and every deposit there. Nothing is hidden.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white mb-1">Contract address</h3>
                  <p className="text-slate-400 mb-2">The ChaosArena contract is deployed at:</p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-emerald-300">
                    <code>0x068b59e118a2de15e5a00e8e09e9a3d4508a3774</code>
                    <button
                      onClick={copyContract}
                      className="hover:text-white p-1 rounded bg-white/5 hover:bg-white/10 cursor-pointer ml-2"
                      title="Copy contract address"
                    >
                      {copiedContract ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    on Arc Testnet. You can read and verify the full source code in the <code>contracts/ChaosArena.sol</code> file in this project.
                  </p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSection('game-3')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Previous: 4. Game 3: Last Person Wins</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('common-questions')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 6. Common Questions</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 6: COMMON QUESTIONS (ALL 8 QUESTIONS)             */}
          {/* ========================================================= */}
          {activeSection === 'common-questions' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="common-questions">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">SECTION 6</span>
                <h2 className="display font-bold text-2xl text-white">Common Questions</h2>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans divide-y divide-white/5">
                <div className="pt-2 first:pt-0">
                  <h4 className="font-bold text-white mb-1">Can I cancel a dare after someone claims it?</h4>
                  <p className="text-slate-400">No. Once a claim is submitted, the dare moves to voting and cannot be cancelled.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">What if the voting window ends and nobody calls Settle?</h4>
                  <p className="text-slate-400">The dare stays in the "voting closed" state until anyone calls Settle. There is no deadline for settlement after the window closes — the funds are not at risk.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">Can I vote on my own dare?</h4>
                  <p className="text-slate-400">Yes, if you hold 0.10 USDC. The contract does not block the creator from voting.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">Can I vote on a dare I claimed?</h4>
                  <p className="text-slate-400">Yes. The claimant can vote YES on their own claim if they hold 0.10 USDC. The contract does not block this. Community norms apply.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">What if my Museum NFT decision is longer than 500 characters?</h4>
                  <p className="text-slate-400">The transaction will revert. Shorten it to 500 characters or fewer.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">Can I win the Museum prize with one mint?</h4>
                  <p className="text-slate-400">Yes, if nobody else mints that month. One mint is enough if you are the sole entrant.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">What happens to the LPW pool if the game has been running for a long time with no winner?</h4>
                  <p className="text-slate-400">The timer only reaches zero if nobody deposits before it expires. In active play this is unlikely. If the game sits completely idle and expires, the winner just needs to call Claim. The funds are safe in the contract.</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-white mb-1">Is this real money?</h4>
                  <p className="text-slate-400">On Arc Testnet, no. Test USDC has no real value. On Arc Mainnet, it would be real USDC. This deployment is testnet only.</p>
                </div>

                {/* Section Navigation Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSection('general-notes')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Previous: 5. General Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('security')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span>Next: 7. Security Notes</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* SECTION 7: SECURITY NOTES                                 */}
          {/* ========================================================= */}
          {activeSection === 'security' && (
            <Card className="p-6 sm:p-8 flex flex-col gap-6" id="security">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 block mb-1">SECTION 7</span>
                <h2 className="display font-bold text-2xl text-white">Security Notes</h2>
                <p className="text-xs text-slate-400 mt-1">
                  This contract has been through a full security review before deployment. Key protections:
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                <li>
                  <strong className="text-white">The platform owner cannot withdraw player funds</strong> under any circumstances.
                </li>
                <li>
                  <strong className="text-white">All USDC movements follow a strict checks-effects-interactions pattern</strong> to prevent reentrancy attacks.
                </li>
                <li>
                  <strong className="text-white">The dare claimant address is always the wallet that submits the claim</strong> — it cannot be redirected.
                </li>
                <li>
                  <strong className="text-white">Museum prize payouts are pull-based:</strong> each winner claims individually, so one blocked wallet cannot prevent others from receiving their share.
                </li>
                <li>
                  <strong className="text-white">A dare with no votes automatically resolves in the creator's favor after 7 days</strong> — bounties cannot be locked permanently.
                </li>
              </ul>

              <div className="p-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/25 mt-2">
                <p className="text-xs text-rose-300 font-mono flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>
                    This is testnet software. It has not been audited by a third-party security firm. Do not use it with real funds.
                  </span>
                </p>
              </div>

              {/* Section Navigation Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveSection('common-questions')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Previous: 6. Common Questions</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('before-you-start')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all cursor-pointer"
                >
                  <span>Back to Start (Section 1)</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
