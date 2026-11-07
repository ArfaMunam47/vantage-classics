import { Link } from "@tanstack/react-router";
import { useRevealFlags } from "@/lib/reveal";

const LINKS = ["HOME", "COLLECTION", "ABOUT", "CONTACT"] as const;

export function Navigation() {
  const revealed = useRevealFlags((s) => s.revealed);
  const introDone = useRevealFlags((s) => s.introDone);

  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-40 transition-opacity duration-1000"
      style={{ opacity: introDone ? 1 : 0 }}
    >
      <div className="flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        {/* Left: brand */}
        <Link to="/" className="pointer-events-auto group flex items-baseline gap-3" data-cursor="hover">
          <span className="font-serif text-xl italic leading-none text-foreground md:text-2xl">
            Vantage
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground transition-colors duration-500 group-hover:text-foreground sm:inline">
            Classics
          </span>
        </Link>

        {/* Next to the brand: small editorial tagline */}
        <p className="absolute left-48 hidden max-w-[180px] 2xl:block text-[9px] leading-relaxed tracking-[0.14em] text-muted-foreground/80 uppercase">
          It&apos;s the classic that never stopped turning heads.
        </p>

        {/* Center: minimal navigation */}
        <nav className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          {LINKS.map((label) => (
            <a
              key={label}
              href="#"
              data-cursor="hover"
              className="relative text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/70 transition-colors duration-300 hover:text-foreground"
            >
              {label}
              <span
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-amber transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />
            </a>
          ))}
        </nav>

        {/* Right: elegant menu action */}
        <button
          type="button"
          data-cursor="hover"
          className="pointer-events-auto group flex h-10 items-center gap-3 pr-1"
          aria-label="Open menu"
        >
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-foreground md:inline">
            {revealed ? "Explore the collection" : "Menu"}
          </span>
          <span className="flex w-8 flex-col items-end gap-1.5">
            <span className="h-px w-8 bg-foreground/80 transition-all duration-500 group-hover:w-6" />
            <span className="h-px w-8 bg-foreground/80 transition-all duration-500 group-hover:w-8" />
          </span>
        </button>
      </div>
    </header>
  );
}
