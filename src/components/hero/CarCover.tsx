import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshPhysicalMaterial,
  type BufferAttribute,
  type Group,
} from "three";
import { revealMotion, smoothstep } from "@/lib/reveal";

/*
 * The grey unveiling cloth: a subdivided sheet draped over the car's
 * silhouette, wrinkled with value noise, that peels off toward the car's
 * left-rear as reveal progress increases (matching the reference film).
 */

const HALF_W = 0.98;
const Z_MIN = -2.62; // rear edge of the cloth
const Z_MAX = 1.98; // nose stays exposed, headlight glowing beneath/around it
const NX = 52;
const NZ = 84;

const fract = (n: number) => n - Math.floor(n);
const hash3 = (x: number, y: number, z: number) =>
  fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123);
const fade = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const zf = fade(z - zi);
  const c = (i: number, j: number, k: number) => hash3(xi + i, yi + j, zi + k);
  const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * xf;
  const x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * xf;
  const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * xf;
  const x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * xf;
  const y0 = x00 + (x10 - x00) * yf;
  const y1 = x01 + (x11 - x01) * yf;
  return y0 + (y1 - y0) * zf;
}

function fbm(x: number, y: number, z: number) {
  return vnoise(x, y, z) * 0.65 + vnoise(x * 2.13, y * 2.13, z * 2.13) * 0.35;
}

/** Height of the car's silhouette at a given point, plus cloth clearance. */
function profileHeight(z: number) {
  const cabin = 0.42 * Math.exp(-Math.pow(z + 0.28, 2) / (2 * 0.72 * 0.72));
  const hoodTaper = 0.16 * clamp((z - 0.5) / 1.5, 0, 1);
  const fastbackSlope = 0.22 * clamp((-1.0 - z) / 1.6, 0, 1);
  return 1.1 + cabin - hoodTaper - fastbackSlope;
}

function baseHeight(x: number, z: number) {
  const ax = Math.abs(x);
  if (ax <= HALF_W) {
    const dome = Math.pow(Math.cos(clamp(ax / HALF_W, 0, 1) * (Math.PI / 2)), 0.72);
    return profileHeight(z) * dome;
  }
  // Skirt pooling on the studio floor
  return 0.02 + 0.05 * Math.exp(-Math.pow((ax - HALF_W) / 0.14, 2));
}

export function CarCover() {
  const group = useRef<Group>(null);
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];
    for (let iz = 0; iz <= NZ; iz++) {
      const z = Z_MIN + ((Z_MAX - Z_MIN) * iz) / NZ;
      for (let ix = 0; ix <= NX; ix++) {
        const x = -1.34 + (2.68 * ix) / NX;
        positions.push(x, baseHeight(x, z), z);
      }
    }
    const row = NX + 1;
    for (let iz = 0; iz < NZ; iz++) {
      for (let ix = 0; ix < NX; ix++) {
        const a = iz * row + ix;
        indices.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
      }
    }
    geo.setIndex(indices);
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Static base positions/x/z kept aside; only y (and slight lateral billow) moves per frame.
  const base = useMemo(() => {
    const pos = geometry.getAttribute("position") as BufferAttribute;
    const arr = pos.array as Float32Array;
    const xs = new Float32Array(arr.length / 3);
    const zs = new Float32Array(arr.length / 3);
    const ys = new Float32Array(arr.length / 3);
    for (let i = 0; i < arr.length; i += 3) {
      xs[i / 3] = arr[i];
      ys[i / 3] = arr[i + 1];
      zs[i / 3] = arr[i + 2];
    }
    return { xs, ys, zs };
  }, [geometry]);

  useFrame((state) => {
    const value = revealMotion.value;
    const time = state.clock.elapsedTime;
    const p = smoothstep(value);

    const g = group.current;
    if (g) {
      g.visible = value < 0.995;
      // Peel off toward the car's left-rear, lifting and rolling as it goes.
      g.position.set(
        p * 3.1,
        p * 1.85 + Math.sin(time * 1.7) * 0.025,
        -p * 2.75,
      );
      g.rotation.z = -p * 1.05;
      g.rotation.x = p * 0.32;
    }

    if (g && g.visible) {
      const pos = geometry.getAttribute("position") as BufferAttribute;
      const arr = pos.array as Float32Array;
      const { xs, ys, zs } = base;
      const amp = 0.045 + 0.34 * p;
      for (let i = 0; i < arr.length; i += 3) {
        const x = xs[i / 3]!;
        const y0 = ys[i / 3]!;
        const z = zs[i / 3]!;
        const skirt = clamp((Math.abs(x) - HALF_W) / 0.36, 0, 1);
        const raised = y0 > 0.1 ? 1 : 0;
        const wobble =
          (fbm(x * 2.2, z * 2.2, time * 0.45) - 0.5) * amp * (0.3 + 0.9 * skirt + 0.5 * p) +
          (raised ? Math.sin(z * 2.4 + x * 1.3 + time * 5.2) * 0.035 * p : 0);
        arr[i] = x + (fbm(x * 1.6, z * 1.6, 7.7 + time * 0.35) - 0.5) * 0.16 * p;
        arr[i + 1] = Math.max(0.015, y0 + wobble);
        arr[i + 2] = z;
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#cfccc4"
          roughness={0.94}
          metalness={0}
          sheen={0.55}
          sheenRoughness={0.7}
          sheenColor="#e8e5de"
          side={2 /* DoubleSide */}
        />
      </mesh>
    </group>
  );
}
