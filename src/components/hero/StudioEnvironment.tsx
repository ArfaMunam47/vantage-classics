import { Lightformer, Environment, Sparkles } from "@react-three/drei";
import type { Group } from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * The dark automotive studio: charcoal angular walls, a polished wet-look
 * black floor, diagonal white LED light tubes, a faint halo ring and soft
 * cinematic key/rim lighting. Environment uses local Lightformers only —
 * no runtime HDR fetches.
 */

function LedTube({
  position,
  rotation,
  length = 9,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[length, 0.055, 0.055]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4.2} toneMapped={false} />
      </mesh>
      {/* faint housing so the tube reads as a physical fixture */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[length + 0.3, 0.03, 0.12]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.6} metalness={0.6} />
      </mesh>
    </group>
  );
}

function ArchitecturalSlab({
  position,
  rotation,
  scale,
  shade = "#0e0e12",
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  shade?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={shade} roughness={0.92} metalness={0.1} />
    </mesh>
  );
}

function HaloRing() {
  const ring = useRef<Group>(null);
  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.02;
    }
  });
  return (
    <group ref={ring} position={[0, 1.55, -2.6]}>
      <mesh>
        <torusGeometry args={[3.35, 0.012, 8, 128]} />
        <meshStandardMaterial color="#b9bcc4" emissive="#c9ccd4" emissiveIntensity={0.9} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function StudioEnvironment() {
  return (
    <group>
      {/* Local image-based lighting: diagonal white strips paint the reflections */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#050506"]} />
        <Lightformer intensity={2.4} position={[0, 6, 0]} scale={[12, 3, 1]} rotation-x={Math.PI / 2} color="#ffffff" />
        <Lightformer intensity={5} position={[-2, 5.2, -1]} scale={[9, 0.35, 1]} rotation={[0.3, 0, 0.55]} color="#ffffff" />
        <Lightformer intensity={4.2} position={[2.4, 4.6, 2]} scale={[8, 0.3, 1]} rotation={[0.25, 0, -0.4]} color="#f4f2ee" />
        <Lightformer intensity={1.1} position={[6, 1.4, 4]} scale={[3, 0.5, 1]} rotation-y={-Math.PI / 2.6} color="#ffb877" />
        <Lightformer intensity={0.7} position={[-7, 1, -3]} scale={[4, 0.6, 1]} rotation-y={Math.PI / 2.4} color="#dfe4ee" />
      </Environment>

      {/* Polished, slightly wet studio floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial
          color="#0a0a0c"
          roughness={0.42}
          metalness={0.72}
          envMapIntensity={0.85}
        />
      </mesh>

      {/* Charcoal angular architecture */}
      <ArchitecturalSlab position={[-13, 4, -4]} rotation={[0, 0.42, 0.16]} scale={[0.6, 12, 22]} />
      <ArchitecturalSlab position={[13, 4, -6]} rotation={[0, -0.38, -0.14]} scale={[0.6, 12, 24]} />
      <ArchitecturalSlab position={[0, 5.5, -14]} rotation={[-0.1, 0, 0]} scale={[30, 10, 0.7]} shade="#101014" />
      <ArchitecturalSlab position={[-7.5, 3.2, -9]} rotation={[0, 0.9, 0]} scale={[9, 7, 0.5]} shade="#0c0c10" />
      <ArchitecturalSlab position={[8, 3.8, -10]} rotation={[0, -1.1, 0]} scale={[10, 8, 0.5]} shade="#0d0d11" />
      <ArchitecturalSlab position={[-6, -0.35, 6]} rotation={[0, 0.6, 0]} scale={[7, 0.5, 4]} shade="#0a0a0d" />
      <ArchitecturalSlab position={[6.5, -0.35, 7]} rotation={[0, -0.5, 0]} scale={[7, 0.5, 4]} shade="#0a0a0d" />

      {/* Diagonal white LED installations */}
      <LedTube position={[0.4, 5.3, -1.6]} rotation={[0.12, 0.15, 0.5]} />
      <LedTube position={[-1.1, 5.0, 2.2]} rotation={[0.08, -0.2, -0.42]} />
      <LedTube position={[2.2, 5.7, -4.5]} rotation={[0.18, 0.3, 0.62]} length={8} />
      <LedTube position={[-3.4, 5.9, -5.5]} rotation={[0.14, -0.28, 0.48]} length={7} />

      {/* Faint halo behind the car, like the reference composition */}
      <HaloRing />

      {/* Cinematic lighting rig */}
      <ambientLight intensity={0.14} color="#dfe3ec" />
      <spotLight
        position={[7, 8.5, 5]}
        angle={0.55}
        penumbra={1}
        intensity={95}
        distance={40}
        decay={2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight position={[-7, 6, -7]} angle={0.6} penumbra={1} intensity={55} distance={40} decay={2} color="#ccd4e6" />
      <spotLight position={[0, 5.5, -9]} angle={0.7} penumbra={1} intensity={35} distance={30} decay={2} color="#9aa2b6" />
      <pointLight position={[0, 1.1, 6.5]} intensity={4} distance={9} decay={2} color="#ffb877" />

      {/* Dust motes in the light beams */}
      <Sparkles count={110} scale={[16, 7, 16]} size={1.6} speed={0.22} opacity={0.32} color="#cfd3da" />
    </group>
  );
}
