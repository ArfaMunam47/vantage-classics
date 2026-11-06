import { useEffect, useRef } from "react";
import { clamp01, revealMotion, useRevealFlags } from "@/lib/reveal";

/*
 * The "DRAG TO REVEAL" arc on the right of the frame, as in the reference:
 * a thin circular arc with a small handle that scrubs the reveal.
 */

const CX = 6;
const CY = 80;
const R = 72;
const A0 = -68; // degrees, start of arc
const A1 = 68; // degrees, end of arc

function pointAt(t: number) {
  const a = ((A0 + (A1 - A0) * t) * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}

const arcStart = pointAt(0);
const arcEnd = pointAt(1);

export function RevealHint() {
  const knobRef = useRef<SVGCircleElement>(null);
  const revealed = useRevealFlags((s) => s.revealed);
  const introDone = useRevealFlags((s) => s.introDone);
  const reducedMotion = useRevealFlags((s) => s.reducedMotion);

  // Knob follows the reveal progress with a light rAF loop.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp01(revealMotion.value);
      const pt = pointAt(p);
      if (knobRef.current) {
        knobRef.current.setAttribute("cx", pt.x.toFixed(2));
        knobRef.current.setAttribute("cy", pt.y.toFixed(2));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Dragging the knob scrubs the reveal.
  useEffect(() => {
    const el = knobRef.current?.parentElement;
    if (!el) return;
    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startTarget = revealMotion.target;
      revealMotion.userInteracted = true;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      revealMotion.target = clamp01(startTarget + (e.clientX - startX) / 220);
    };
    const up = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  if (revealed) return null;

  return (
    <div
      className="absolute right-4 top-1/2 z-30 -translate-y-1/2 transition-opacity duration-1000 md:right-10"
      style={{ opacity: introDone ? 1 : 0 }}
    >
      <div className="flex items-center gap-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.34em] text-foreground/70 md:text-[10px]">
          {reducedMotion ? "Tap to reveal" : "Drag to reveal"}
        </p>
        <svg
          width="96"
          height="160"
          viewBox="0 0 96 160"
          fill="none"
          className="touch-none"
          data-cursor="hover"
          role="slider"
          aria-label="Reveal the car"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <path
            d={`M ${arcStart.x.toFixed(2)} ${arcStart.y.toFixed(2)} A ${R} ${R} 0 0 1 ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`}
            stroke="currentColor"
            className="text-foreground/35"
            strokeWidth="1"
            fill="none"
          />
          {[0, 0.5, 1].map((t) => {
            const pt = pointAt(t);
            return (
              <line
                key={t}
                x1={pt.x - 4}
                y1={pt.y}
                x2={pt.x + 4}
                y2={pt.y}
                stroke="currentColor"
                className="text-foreground/40"
                strokeWidth="1"
              />
            );
          })}
          <circle ref={knobRef} r="5" className="fill-foreground" />
        </svg>
      </div>
    </div>
  );
}
