import { lazy, Suspense, useCallback } from "react";
import { clamp01, revealMotion } from "@/lib/reveal";
import { Navigation } from "./Navigation";
import { HeroTypography } from "./HeroTypography";
import { RevealHint } from "./RevealHint";
import { CustomCursor } from "./CustomCursor";
import { LoadingScreen } from "./LoadingScreen";

const HeroExperience = lazy(() => import("./HeroExperience"));

/**
 * Full-viewport cinematic stage: 3D studio beneath, editorial overlays on
 * top, and a drag layer that scrubs the reveal. Everything three-related
 * lives behind the lazy boundary; SSR only ever sees this static shell.
 */
export default function HeroStage() {
  const onSceneReady = useCallback(() => {
    document
      .querySelector("[data-hero-stage]")
      ?.setAttribute("data-scene-ready", "true");
  }, []);

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    revealMotion.userInteracted = true;
    revealMotion.dragging = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    (e.currentTarget as HTMLDivElement).dataset.startX = String(e.clientX);
    (e.currentTarget as HTMLDivElement).dataset.startTarget = String(revealMotion.target);
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!revealMotion.dragging) return;
    const el = e.currentTarget as HTMLDivElement;
    const startX = Number(el.dataset.startX ?? e.clientX);
    const startTarget = Number(el.dataset.startTarget ?? 0);
    const width = el.getBoundingClientRect().width || 1;
    revealMotion.target = clamp01(startTarget + (e.clientX - startX) / (width * 0.55));
  };

  const onDragEnd = () => {
    revealMotion.dragging = false;
  };

  return (
    <div data-hero-stage className="relative h-full w-full overflow-hidden">
      {/* 3D cinematic studio */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <HeroExperience onSceneReady={onSceneReady} />
        </Suspense>
      </div>

      {/* Drag-to-reveal surface */}
      <div
        className="absolute inset-0 z-10 touch-none"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        aria-hidden
      />

      {/* Editorial overlays */}
      <HeroTypography />
      <RevealHint />
      <Navigation />

      {/* Cinematic grade: vignette + film grain */}
      <div className="hero-vignette pointer-events-none absolute inset-0 z-[25]" aria-hidden />
      <div className="hero-grain pointer-events-none absolute inset-0 z-[26]" aria-hidden />

      {/* Loading screen */}
      <LoadingScreen />

      {/* Custom cursor */}
      <CustomCursor />
    </div>
  );
}
