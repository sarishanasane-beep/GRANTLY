import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface PlaceholderGatewayProps {
  reducedMotion?: boolean;
}

/**
 * Procedural Geometric Gateway Crest.
 * Blends deep forest emerald, jade reflections, and champagne gold orbital rings
 * with subtle ambient particles. Procedural and lightweight, completely prepared
 * for seamless future replacement with Meshy AI Pro GLB assets.
 */
export const PlaceholderGateway: React.FC<PlaceholderGatewayProps> = ({ reducedMotion = false }) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.12;
      outerRingRef.current.rotation.x += delta * 0.08;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.y -= delta * 0.15;
      middleRingRef.current.rotation.z += delta * 0.09;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x += delta * 0.18;
      innerRingRef.current.rotation.z -= delta * 0.14;
    }
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += delta * 0.22;
      coreMeshRef.current.rotation.x += delta * 0.1;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.18;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient floating atmosphere particles */}
      <Sparkles
        count={35}
        scale={7}
        size={2.8}
        speed={reducedMotion ? 0.05 : 0.4}
        color="#34d399"
        opacity={0.65}
      />
      <Sparkles
        count={25}
        scale={6}
        size={2.2}
        speed={reducedMotion ? 0.05 : 0.3}
        color="#e6ca65"
        opacity={0.55}
      />

      <Float
        speed={reducedMotion ? 0 : 1.8}
        rotationIntensity={reducedMotion ? 0 : 0.4}
        floatIntensity={reducedMotion ? 0 : 0.8}
      >
        <group scale={[1.1, 1.1, 1.1]}>
          {/* Core Faceted Emerald Geode */}
          <mesh ref={coreMeshRef}>
            <octahedronGeometry args={[1.35, 1]} />
            <meshStandardMaterial
              color="#059669"
              emissive="#064e3b"
              emissiveIntensity={0.3}
              roughness={0.18}
              metalness={0.82}
            />
          </mesh>

          {/* Wireframe Hexagonal Cage */}
          <mesh ref={wireframeRef}>
            <icosahedronGeometry args={[1.55, 1]} />
            <meshStandardMaterial
              color="#34d399"
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Outer Champagne Gold Orbital Ring */}
          <mesh ref={outerRingRef} rotation={[Math.PI / 3, Math.PI / 8, 0]}>
            <torusGeometry args={[2.5, 0.035, 16, 80]} />
            <meshStandardMaterial
              color="#e6ca65"
              metalness={0.92}
              roughness={0.2}
            />
          </mesh>

          {/* Middle Jade Interlocking Ring */}
          <mesh ref={middleRingRef} rotation={[-Math.PI / 4, Math.PI / 5, 0]}>
            <torusGeometry args={[2.1, 0.028, 16, 64]} />
            <meshStandardMaterial
              color="#10b981"
              metalness={0.78}
              roughness={0.25}
            />
          </mesh>

          {/* Inner Accent Ring */}
          <mesh ref={innerRingRef} rotation={[Math.PI / 6, -Math.PI / 3, 0]}>
            <torusGeometry args={[1.75, 0.022, 16, 48]} />
            <meshStandardMaterial
              color="#f3db85"
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>

          {/* Satellite Constellation Nodes */}
          {[
            [-2.0, 0.8, 0.5],
            [2.1, -0.6, -0.4],
            [0.2, 2.2, -0.6],
            [-0.3, -2.1, 0.7],
          ].map((pos, idx) => (
            <mesh key={idx} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial
                color="#e6ca65"
                emissive="#f59e0b"
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
};
