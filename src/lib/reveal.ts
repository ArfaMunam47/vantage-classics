import { create } from "zustand";

/**
 * Shared, per-frame motion state for the hero reveal.
 *
 * Lives outside React so the 3D scene can read it in useFrame without
 * re-rendering, and DOM overlays can read it from their own rAF loops.
 */
export const revealMotion = {
  /** Smoothed reveal progress, 0 (covered) .. 1 (fully revealed). */
  value: 0,
  /** Target progress the scene damps toward. Drags and tweens write here. */
  target: 0,
  dragging: false,
  /** True once the visitor has interacted — cancels the auto reveal. */
  userInteracted: false,
  /** Normalized pointer position (-1..1) for camera parallax. */
  parallax: { x: 0, y: 0 },
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Smoothstep easing used by the camera path and cloth. */
export const smoothstep = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

interface RevealFlags {
  introDone: boolean;
  revealed: boolean;
  reducedMotion: boolean;
  setIntroDone: (v: boolean) => void;
  setRevealed: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

/** Discrete UI flags (React state) — flips text, hints and overlays. */
export const useRevealFlags = create<RevealFlags>((set) => ({
  introDone: false,
  revealed: false,
  reducedMotion: false,
  setIntroDone: (v) => set({ introDone: v }),
  setRevealed: (v) => set({ revealed: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}));
