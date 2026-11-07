import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Sparkles, Center } from '@react-three/drei';
import * as THREE from 'three';

interface CinematicHeroModelProps {
  reducedMotion?: boolean;
}

/**
 * Procedural Fallback Component while GLTF asset is resolving
 */
export const GatewayFallback: React.FC<{ reducedMotion?: boolean }> = ({ reducedMotion = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.1, 2]} />
        <meshStandardMaterial
          color="#059669"
          emissive="#064e3b"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>
    </group>
  );
};

/**
 * Refined Cinematic 3D Hero Model for GRANTLY
 * - Centerpiece: Floating, radiant Emerald Crystal Sphere with multi-axis rotation.
 * - Arch: Scaled-down, darker, ambient sculptural backdrop (non-dominant, not a "door").
 * - Orbital Elements: Concentric champagne-gold and jade rings.
 * - Lighting & Particles: Restrained, sophisticated ambient dust.
 */
export const CinematicHeroModel: React.FC<CinematicHeroModelProps> = ({ reducedMotion = false }) => {
  const modelGroupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const archRef = useRef<THREE.Group>(null);

  // Load the optimized Meshy AI GLB assets from public/models/optimized/
  const { scene: gatewayScene } = useGLTF('/models/optimized/gateway.glb');
  const { scene: sphereScene } = useGLTF('/models/optimized/sphere.glb');

  // Gateway clone — smaller, darker, ambient background element
  const clonedGateway = useMemo(() => {
    const clone = gatewayScene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color('#1F2A1F');
          mat.roughness = 0.75;
          mat.metalness = 0.25;
          mat.envMapIntensity = 0.6;
          mat.transparent = true;
          mat.opacity = 0.85;
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [gatewayScene]);

  // Crystal Sphere clone — luminous visual centerpiece
  const clonedSphere = useMemo(() => {
    const clone = sphereScene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.roughness = 0.18;
          mat.metalness = 0.82;
          mat.emissive = new THREE.Color('#1F2A1F');
          mat.emissiveIntensity = 0.4;
          mat.envMapIntensity = 1.8;
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [sphereScene]);

  // Animation loop with smooth dampening
  useFrame((state, delta) => {
    if (reducedMotion) return;

    // Smooth pointer parallax reaction on the whole composition
    if (modelGroupRef.current) {
      const targetRotY = state.pointer.x * 0.28;
      const targetRotX = -state.pointer.y * 0.18;
      modelGroupRef.current.rotation.y = THREE.MathUtils.damp(
        modelGroupRef.current.rotation.y,
        targetRotY,
        2.5,
        delta
      );
      modelGroupRef.current.rotation.x = THREE.MathUtils.damp(
        modelGroupRef.current.rotation.x,
        targetRotX,
        2.5,
        delta
      );
    }

    // Floating Crystal Sphere centerpiece rotation & breathing
    if (orbRef.current) {
      orbRef.current.rotation.y += delta * 0.4;
      orbRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
      orbRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    }

    // Subtle ambient sway on the background arch
    if (archRef.current) {
      archRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    }

    // Delicate orbital ring movements
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += delta * 0.25;
      innerRingRef.current.rotation.x += delta * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y -= delta * 0.2;
      outerRingRef.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <group ref={modelGroupRef} position={[0, -0.05, 0]}>
      {/* Restrained Atmospheric Dust Particles */}
      <Sparkles
        count={20}
        scale={6}
        size={2.4}
        speed={reducedMotion ? 0.04 : 0.25}
        color="#8CA98C"
        opacity={0.65}
      />
      <Sparkles
        count={14}
        scale={5.5}
        size={2.0}
        speed={reducedMotion ? 0.03 : 0.2}
        color="#D9C7A3"
        opacity={0.55}
      />

      {/* Gentle Floating Motion */}
      <Float
        speed={reducedMotion ? 0 : 1.4}
        rotationIntensity={reducedMotion ? 0 : 0.16}
        floatIntensity={reducedMotion ? 0 : 0.35}
      >
        <group>
          {/* 1. Ambient Background Arch (Recessed, darker, framing the sphere) */}
          <group ref={archRef} position={[0, -0.75, -0.7]}>
            <Center top>
              <primitive object={clonedGateway} scale={[1.15, 1.15, 1.15]} />
            </Center>
          </group>

          {/* 2. Floating Radiant Emerald Crystal Sphere (Centerpiece) */}
          <group ref={orbRef} position={[0, 0, 0.15]}>
            <Center>
              <primitive object={clonedSphere} scale={[0.85, 0.85, 0.85]} />
            </Center>

            {/* Glowing Accent Ring 1 — Champagne Gold */}
            <mesh ref={innerRingRef}>
              <torusGeometry args={[0.98, 0.016, 16, 64]} />
              <meshStandardMaterial
                color="#D9C7A3"
                emissive="#B08D57"
                emissiveIntensity={0.6}
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing Accent Ring 2 — Forest Sage */}
            <mesh ref={outerRingRef} rotation={[Math.PI / 3.2, 0, 0]}>
              <torusGeometry args={[1.2, 0.012, 16, 64]} />
              <meshStandardMaterial
                color="#8CA98C"
                emissive="#3E5A3F"
                emissiveIntensity={0.5}
                roughness={0.25}
                metalness={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
};

// Preload optimized assets for instant caching
useGLTF.preload('/models/optimized/gateway.glb');
useGLTF.preload('/models/optimized/sphere.glb');
