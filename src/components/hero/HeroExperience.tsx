import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, MathUtils, type Camera } from "three";
import {
  clamp01,
  revealMotion,
  smoothstep,
  useRevealFlags,
} from "@/lib/reveal";
import { StudioEnvironment } from "./StudioEnvironment";
import { CarModel } from "./CarModel";
import { CarCover } from "./CarCover";

/** Camera path: front-left elevated -> low rear-left -> full sweep -> low front-right hero. */
const CAMERA_PATH: [number, number, number][] = [
  [5.6, 1.95, 6.3],
  [6.35, 1.3, 1.1],
  [5.0, 0.95, -5.0],
  [0.4, 0.85, -7.5],
  [-5.9, 0.9, -4.6],
  [-6.3, 0.95, 3.0],
  [-4.9, 0.85, 6.1],
];
const CAMERA_TARGETS: [number, number, number][] = [
  [0, 0.9, 0],
  [0.1, 0.8, 0],
  [0, 0.72, -0.9],
  [0, 0.72, -1.0],
  [0.1, 0.68, -0.4],
  [0.25, 0.65, 0.3],
  [0.3, 0.62, 0.6],
];

function sampleKeys(keys: [number, number, number][], t: number, out: number[]) {
  const n = keys.length - 1;
  const f = Math.min(n, Math.max(0, t * n));
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  // Catmull-Rom style smooth blend between keyframes
    const e = k * k * (3 - 2 * k);
    for (let a = 0; a < 3; a++) {
      out[a] = MathUtils.lerp(
        keys[i]![a],
        keys[i + 1]![a],
        e,
      );
    }
}

function CameraRig() {
  const { camera, size } = useThree();
  const pos = useRef<number[]>([0, 0, 0]);
  const target = useRef<number[]>([0, 0, 0]);
  const parallax = useRef({ x: 0, y: 0 });
  const revealed = useRevealFlags((s) => s.revealed);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // Damped reveal progress
    revealMotion.value = MathUtils.damp(
      revealMotion.value,
      revealMotion.target,
      3.2,
      dt,
    );
    if (revealMotion.value > 0.995 && !useRevealFlags.getState().revealed) {
      useRevealFlags.getState().setRevealed(true);
    }

    const p = smoothstep(revealMotion.value);
    const t = state.clock.elapsedTime;
    const wide = size.width / size.height < 0.85;
    const distance = wide ? 1.38 : 1;

    sampleKeys(CAMERA_PATH, p, pos.current);
    sampleKeys(CAMERA_TARGETS, p, target.current);

    // Calm idle drift + gentle parallax, kept subtle to stay cinematic
    const swayX = Math.sin(t * 0.16) * 0.14;
    const swayY = Math.sin(t * 0.11) * 0.05;
    parallax.current.x = MathUtils.damp(parallax.current.x, revealMotion.parallax.x, 3, dt);
    parallax.current.y = MathUtils.damp(parallax.current.y, revealMotion.parallax.y, 3, dt);
    const parallaxScale = revealed ? 0.32 : 0.5;

    const cam = camera as Camera;
    cam.position.set(
      pos.current[0]! * distance + swayX + parallax.current.x * parallaxScale,
      pos.current[1]! * distance + swayY - parallax.current.y * parallaxScale * 0.5,
      pos.current[2]! * distance,
    );
    cam.lookAt(
      target.current[0]! - parallax.current.x * 0.25,
      target.current[1]! + parallax.current.y * 0.15,
      target.current[2]!,
    );
  });

  // Wider field of view on portrait screens so the car always fits
  useEffect(() => {
    const wide = size.width / size.height >= 0.85;
    (camera as Camera & { fov: number }).fov = wide ? 32 : 44;
    (camera as Camera & { updateProjectionMatrix: () => void }).updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function HeroExperience({
  onSceneReady,
}: {
  onSceneReady?: () => void;
}) {
  const setReducedMotion = useRevealFlags((s) => s.setReducedMotion);
  const reducedMotion = useRevealFlags((s) => s.reducedMotion);
  const setIntroDone = useRevealFlags((s) => s.setIntroDone);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setReducedMotion]);

  // Auto cinematic reveal: if the visitor never drags, the film plays itself.
  useEffect(() => {
    if (reducedMotion) return;
    let tween: { kill: () => void } | null = null;
    let raf = 0;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || revealMotion.userInteracted || revealMotion.target > 0) return;
      void import("gsap").then(({ gsap }) => {
        if (cancelled) return;
        tween = gsap.to(revealMotion, {
          target: 1,
          duration: 5.4,
          ease: "power2.inOut",
        });
      });
    }, 6800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      tween?.kill();
    };
  }, [reducedMotion]);

  // Intro fade: let the studio emerge from black shortly after mount.
  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), 1000);
    return () => window.clearTimeout(t);
  }, [setIntroDone]);

  const gl = useMemo(
    () => ({ antialias: true, powerPreference: "high-performance" as const }),
    [],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={gl}
      camera={{ fov: 32, near: 0.1, far: 90, position: [5.6, 1.95, 6.3] }}
      onCreated={({ gl: renderer, camera }) => {
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        camera.lookAt(0, 0.85, 0);
        onSceneReady?.();
      }}
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 15, 38]} />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <CarModel />
        <CarCover />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

export {};
