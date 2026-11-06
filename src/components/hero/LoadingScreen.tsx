import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useRevealFlags } from "@/lib/reveal";

/**
 * Graceful loading screen: brand wordmark and a thin progress line.
 * Fades out once the 3D assets finish loading, then starts the intro.
 */
export function LoadingScreen() {
  const { progress } = useProgress();
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const setIntroDone = useRevealFlags((s) => s.setIntroDone);

  useEffect(() => {
    if (progress >= 100 && !fading) {
      const t1 = window.setTimeout(() => setFading(true), 450);
      return () => window.clearTimeout(t1);
    }
  }, [progress, fading]);

  useEffect(() => {
    if (!fading) return;
    const t2 = window.setTimeout(() => {
      setGone(true);
      setIntroDone(true);
    }, 900);
    return () => window.clearTimeout(t2);
  }, [fading, setIntroDone]);

  if (gone) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }}
    >
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-2xl italic text-foreground md:text-3xl">Vantage</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
          Classics
        </span>
      </div>
      <div className="mt-8 h-px w-40 overflow-hidden bg-foreground/15">
        <div
          className="h-full bg-foreground/80 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
      <p className="mt-4 text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60">
        Preparing the studio
      </p>
    </div>
  );
}
