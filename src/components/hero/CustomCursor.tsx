import { useEffect, useRef, useState } from "react";
import { revealMotion, useRevealFlags } from "@/lib/reveal";

type CursorMode = "default" | "hover" | "explore";

/**
 * Small, precise custom cursor: a thin white ring with a trailing dot.
 * Expands over interactive elements; shows EXPLORE over the scene after
 * the reveal. Disabled entirely on touch devices.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const revealed = useRevealFlags((s) => s.revealed);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine);
    if (!fine) return;
    document.documentElement.classList.add("no-native-cursor");
    return () => document.documentElement.classList.remove("no-native-cursor");
  }, []);

  // Hover target detection
  useEffect(() => {
    if (!enabled) return;
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest(
        "a, button, [data-cursor='hover']",
      );
      setMode(el ? "hover" : "default");
    };
    window.addEventListener("mouseover", onOver);
    return () => window.removeEventListener("mouseover", onOver);
  }, [enabled]);

  // Smooth trailing follow
  useEffect(() => {
    if (!enabled) return;
    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      revealMotion.parallax.x = (e.clientX / window.innerWidth) * 2 - 1;
      revealMotion.parallax.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("no-native-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const explore = revealed && mode === "default";

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full border border-foreground/60 transition-[width,height,background-color,border-color] duration-300"
        style={{
          width: mode === "hover" ? 52 : explore ? 64 : 30,
          height: mode === "hover" ? 52 : explore ? 64 : 30,
          backgroundColor: mode === "hover" ? "color-mix(in oklab, var(--foreground) 12%, transparent)" : "transparent",
        }}
      >
        {explore && (
          <span className="text-[6.5px] font-medium uppercase tracking-[0.32em] text-foreground/90">
            Explore
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1 w-1 rounded-full bg-foreground"
      />
    </>
  );
}
