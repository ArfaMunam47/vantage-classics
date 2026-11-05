import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  AdditiveBlending,
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  type Group,
  type Material,
} from "three";
import { revealMotion } from "@/lib/reveal";

useGLTF.preload("/models/mustang-fastback.glb");

/** Radial glow sprite texture, generated once on the client. */
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(canvas);
  }, []);
}

function Glow({
  position,
  color,
  scale,
  lightIntensity,
  texture,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  lightIntensity: number;
  texture: CanvasTexture;
}) {
  return (
    <group position={position}>
      <sprite scale={[scale, scale, 1]}>
        <spriteMaterial
          map={texture}
          color={color}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0.85}
        />
      </sprite>
      <pointLight color={color} intensity={lightIntensity} distance={7} decay={2} />
    </group>
  );
}

export function CarModel() {
  const { scene } = useGLTF("/models/mustang-fastback.glb");
  const group = useRef<Group>(null);
  const glowTex = useGlowTexture();
  const headLights = useRef<PointLight[]>([]);
  const tailLights = useRef<PointLight[]>([]);

  // One-time material and shadow tuning on the baked model.
  useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const material = mesh.material as Material | Material[];
      const mats = Array.isArray(material) ? material : [material];
      for (const m of mats) {
        const std = m as MeshStandardMaterial;
        if (!std.name) continue;
        const n = std.name;
        if (n.includes("Glass")) {
          std.transparent = true;
          std.opacity = 0.72;
          std.roughness = 0.08;
          std.metalness = 1;
          std.envMapIntensity = 2.4;
        } else if (n.includes("Tire")) {
          std.roughness = 0.92;
          std.metalness = 0.05;
          std.envMapIntensity = 0.5;
        } else if (
          n.includes("Rim") ||
          n.includes("Bumper") ||
          n.includes("Grill") ||
          n.includes("Handle") ||
          n.includes("Mirror") ||
          n.includes("Bolt") ||
          n.includes("Axel") ||
          n.includes("Pipe") ||
          n.includes("Muffler") ||
          n.includes("Wipers") ||
          n.includes("Luggage")
        ) {
          std.metalness = 1;
          std.roughness = 0.24;
          std.envMapIntensity = 1.9;
        } else if (
          n.includes("Body") ||
          n.includes("Hood") ||
          n.includes("Door") ||
          n.includes("Trunk") ||
          n.includes("Filler") ||
          n.includes("Plate")
        ) {
          std.metalness = 0.82;
          std.roughness = 0.32;
          std.envMapIntensity = 1.35;
        } else if (n.includes("Headlight")) {
          std.emissive = std.emissive ?? std.emissive;
          std.emissiveIntensity = Math.max(std.emissiveIntensity, 0.9);
          std.envMapIntensity = 1.6;
        } else {
          std.envMapIntensity = 0.9;
        }
        std.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    // Headlights breathe slightly and bloom once the car is unveiled.
    const p = revealMotion.value;
    const t = state.clock.elapsedTime;
    const flicker = 0.92 + Math.sin(t * 7.3) * 0.04 + Math.sin(t * 2.1) * 0.04;
    for (const l of headLights.current) {
      if (l) l.intensity = (5.5 + p * 4.5) * flicker;
    }
    for (const l of tailLights.current) {
      if (l) l.intensity = 1.4 + p * 2.6;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
      {/* Warm amber headlight glow — visible even through the cover, like the reference */}
      <Glow position={[-0.66, 0.56, 2.34]} color="#ffb877" scale={0.9} lightIntensity={5.5} texture={glowTex} />
      <Glow position={[0.66, 0.56, 2.34]} color="#ffb877" scale={0.9} lightIntensity={5.5} texture={glowTex} />
      {/* Low red taillight wash */}
      <Glow position={[-0.62, 0.78, -2.4]} color="#ff5140" scale={0.55} lightIntensity={1.4} texture={glowTex} />
      <Glow position={[0.62, 0.78, -2.4]} color="#ff5140" scale={0.55} lightIntensity={1.4} texture={glowTex} />
    </group>
  );
}
