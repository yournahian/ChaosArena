import React, { ReactNode } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { EXPLORER } from '../chaosArena'

export function Card({
  children,
  className = '',
  style,
  glow,
  interactive,
  crosshair = true,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  glow?: 'cyan' | 'mint' | 'purple' | 'amber'
  interactive?: boolean
  crosshair?: boolean
}) {
  const glowBorder = glow
    ? glow === 'cyan'
      ? 'border-cyan-500/40 glow-cyan'
      : glow === 'mint'
      ? 'border-emerald-400/40 glow-mint'
      : glow === 'purple'
      ? 'border-purple-500/40 glow-purple'
      : 'border-amber-400/40'
    : 'border-white/[0.08]'

  return (
    <div
      className={`kima-card p-6 sm:p-7 border ${glowBorder} ${
        interactive ? 'hover:border-white/25 cursor-pointer' : ''
      } ${crosshair ? 'corner-crosshair' : ''} ${className}`}
      style={style}
    >
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

export function TechBadge({ children, color = 'mint' }: { children: ReactNode; color?: 'mint' | 'cyan' | 'purple' | 'amber' }) {
  const colors = {
    mint: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  }[color]

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide uppercase border ${colors}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  )
}

export function SectionTitle({
  children,
  subtitle,
  badge,
  step,
  action,
}: {
  children: ReactNode
  subtitle?: string
  badge?: string
  step?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {step && (
            <span className="text-xs font-mono font-bold text-slate-500">
              [{step}]
            </span>
          )}
          {badge && <TechBadge color="cyan">{badge}</TechBadge>}
        </div>
        <h2 className="display font-bold text-2xl sm:text-3xl text-white tracking-tight">
          {children}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 max-w-xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
      {children}
    </span>
  )
}

export function PrimaryBtn({
  children,
  onClick,
  disabled,
  loading,
  variant = 'mint',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'mint' | 'cyan' | 'purple' | 'amber' | 'white'
}) {
  const styles = {
    mint: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 border-emerald-300/30',
    cyan: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 border-cyan-300/30',
    purple: 'bg-purple-500 text-white hover:bg-purple-400 shadow-lg shadow-purple-500/20 border-purple-400/30',
    amber: 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20 border-amber-300/30',
    white: 'bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 border-white/20',
  }[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-full font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] border ${
        disabled || loading
          ? 'bg-slate-800/60 text-slate-500 border-white/5 cursor-not-allowed shadow-none'
          : styles
      }`}
    >
      {loading && <Loader2 size={16} className="animate-spin text-current" />}
      <span className="flex items-center gap-2">{children}</span>
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] border border-white/10 hover:border-white/30 hover:bg-white/[0.04] text-slate-300 hover:text-white ${
        disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  suffix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  maxLength?: number
  suffix?: string
}) {
  return (
    <div className="relative flex items-center">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all font-sans"
      />
      {suffix && (
        <span className="absolute right-4 text-xs font-mono font-bold text-slate-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  )
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 resize-none transition-all font-sans"
      />
      {maxLength && (
        <span className="absolute right-3 bottom-2.5 text-[10px] font-mono text-slate-500 pointer-events-none">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}

export function TxLink({ hash }: { hash: `0x${string}` }) {
  return (
    <a
      href={`${EXPLORER}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline transition-all mt-1"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      View Transaction on Arc Explorer <ExternalLink size={12} />
    </a>
  )
}

export function Badge({
  children,
  color = 'blue',
}: {
  children: ReactNode
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple'
}) {
  const styles = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    yellow: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    blue: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  }[color]

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

export function formatAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
