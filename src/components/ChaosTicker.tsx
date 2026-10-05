export function ChaosTicker() {
  return (
    <div className="w-full border-y border-white/[0.08] bg-[#050609] py-6 overflow-hidden select-none">
      <div className="animate-marquee-chaos flex items-center gap-16 whitespace-nowrap text-6xl sm:text-8xl md:text-9xl font-black display tracking-tighter opacity-80 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={`first-${i}`}
            className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-700 shrink-0"
          >
            _$CHAOS
          </span>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={`second-${i}`}
            className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-700 shrink-0"
          >
            _$CHAOS
          </span>
        ))}
      </div>
    </div>
  )
}
