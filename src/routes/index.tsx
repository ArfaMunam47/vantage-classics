import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const HeroStage = lazy(() => import("@/components/hero/HeroStage"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vantage Classics — 1968 Mustang Fastback" },
      {
        name: "description",
        content:
          "A cinematic 3D reveal of the 1968 Mustang Fastback — a dark studio, diagonal light, and a timeless classic uncovered.",
      },
      { property: "og:title", content: "Vantage Classics — 1968 Mustang Fastback" },
      {
        property: "og:description",
        content: "Rediscover the classics. A cinematic, interactive 3D automotive reveal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

/** Static, no-WebGL composition — same typography, quiet dark studio gradient. */
function StaticFallback() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-background px-6 py-24 md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 60%, color-mix(in oklab, var(--foreground) 7%, transparent), transparent 70%)",
        }}
      />
      <div>
        <h1 className="text-4xl leading-[1.08] font-light uppercase tracking-[0.06em] text-foreground md:text-6xl">
          Rediscover
          <span className="block font-serif normal-case italic font-normal">
            the <span className="not-italic font-sans font-light uppercase">Classics</span>
          </span>
        </h1>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/70">
          Vantage Classics — Est. 1968
        </p>
        <p className="max-w-[240px] text-[11px] leading-[1.8] tracking-[0.08em] text-muted-foreground">
          It&apos;s a look that has spanned generations — a timeless masterpiece.
        </p>
      </div>
    </div>
  );
}

function Index() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(supportsWebGL());
  }, []);

  return (
    <section
      className="relative h-screen min-h-[560px] w-full overflow-hidden bg-background text-foreground"
      style={{ touchAction: "none" }}
    >
      {hasWebGL === false ? (
        <StaticFallback />
      ) : (
        <Suspense fallback={null}>
          <HeroStage />
        </Suspense>
      )}
    </section>
  );
}
