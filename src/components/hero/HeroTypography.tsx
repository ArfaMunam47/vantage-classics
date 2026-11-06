import { useRevealFlags } from "@/lib/reveal";

/**
 * Minimal editorial typography. Before the reveal: REDISCOVER the CLASSICS.
 * After: MUSTANG / FASTBACK with the giant ghosted 1968. The car stays the
 * hero — text is small, quiet, and positioned at the frame edges.
 */
export function HeroTypography() {
  const revealed = useRevealFlags((s) => s.revealed);
  const introDone = useRevealFlags((s) => s.introDone);

  const base =
    "transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* Headline — covered state */}
      <div
        className={`absolute left-6 top-[22%] md:left-12 md:top-[24%] ${base}`}
        style={{
          opacity: introDone && !revealed ? 1 : 0,
          transform: `translateY(${introDone && !revealed ? 0 : 18}px)`,
        }}
      >
        <h1 className="text-4xl leading-[1.08] font-light uppercase tracking-[0.06em] text-foreground md:text-6xl">
          Rediscover
          <span className="block font-serif normal-case italic font-normal text-foreground/95">
            the <span className="not-italic font-sans font-light uppercase">Classics</span>
          </span>
        </h1>
      </div>

      {/* Headline — revealed state */}
      <div
        className={`absolute left-6 top-[20%] md:left-12 md:top-[21%] ${base}`}
        style={{
          opacity: revealed ? 1 : 0,
          transform: `translateY(${revealed ? 0 : 24}px)`,
        }}
      >
        <h2 className="text-4xl leading-[1.06] font-light uppercase tracking-[0.05em] text-foreground md:text-6xl">
          Mustang
          <span className="block">Fastback</span>
        </h2>
      </div>

      {/* Giant ghosted year */}
      <div
        aria-hidden
        className={`absolute right-[-2%] top-1/2 -translate-y-1/2 font-sans text-[26vw] font-semibold leading-none tracking-tight text-foreground/[0.06] md:right-[1%] md:text-[19vw] ${base}`}
        style={{
          opacity: revealed ? 1 : 0,
          transform: `translateY(-50%) translateX(${revealed ? 0 : 60}px)`,
        }}
      >
        1968
      </div>

      {/* Supporting statement, bottom right */}
      <div
        className={`absolute bottom-10 right-6 max-w-[240px] md:bottom-12 md:right-14 md:max-w-[280px] ${base}`}
        style={{
          opacity: introDone ? 1 : 0,
          transform: `translateY(${introDone ? 0 : 16}px)`,
        }}
      >
        <p className="text-[11px] leading-[1.8] tracking-[0.08em] text-muted-foreground md:text-xs">
          It&apos;s a look that has spanned generations and continues to evolve
          — a timeless masterpiece.
        </p>
      </div>

      {/* Quiet corner note, bottom left */}
      <div
        className={`absolute bottom-10 left-6 md:bottom-12 md:left-14 ${base}`}
        style={{ opacity: introDone ? 1 : 0 }}
      >
        <p className="text-[9px] uppercase leading-relaxed tracking-[0.3em] text-muted-foreground/70">
          Vantage Classics
          <span className="block text-muted-foreground/50">Est. 1968 — Classics Dept.</span>
        </p>
      </div>
    </div>
  );
}
