import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Center, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { GlobalLoader } from '@/components/loading/GlobalLoader';

interface ScrollModelCanvasProps {
  modelPath: string;
  nextModelPath?: string;
  scale?: number;
  initialRotation?: [number, number, number];
  accentColor?: string;
  className?: string;
  spinSpeed?: number;
}

/**
 * Individual Model Renderer inside R3F Canvas
 */
const ModelRenderer: React.FC<{
  modelPath: string;
  scale: number;
  initialRotation: [number, number, number];
  spinSpeed: number;
  accentColor: string;
  reducedMotion: boolean;
}> = ({ modelPath, scale, initialRotation, spinSpeed, accentColor, reducedMotion }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene with optimized material settings
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.envMapIntensity = 1.3;
          mat.roughness = Math.min(mat.roughness ?? 0.5, 0.65);
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    // Gentle continuous rotation
    groupRef.current.rotation.y += delta * spinSpeed;

    // Pointer parallax reaction
    const targetRotX = initialRotation[0] - state.pointer.y * 0.15;
    const targetRotZ = initialRotation[2] + state.pointer.x * 0.12;
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      3.0,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotZ,
      3.0,
      delta
    );
  });

  return (
    <group ref={groupRef} rotation={initialRotation}>
      <Sparkles
        count={12}
        scale={4.2}
        size={2.0}
        speed={reducedMotion ? 0.05 : 0.3}
        color={accentColor}
        opacity={0.55}
      />
      <Float
        speed={reducedMotion ? 0 : 1.6}
        rotationIntensity={reducedMotion ? 0 : 0.18}
        floatIntensity={reducedMotion ? 0 : 0.3}
      >
        <Center>
          <primitive object={clonedScene} scale={[scale, scale, scale]} />
        </Center>
      </Float>
    </group>
  );
};

/**
 * ScrollModelCanvas
 * Viewport-aware 3D canvas with intelligent predictive preloading.
 * Mounts only when near viewport, pauses compute when offscreen,
 * and preloads the next section model in background idle time.
 */
export const ScrollModelCanvas: React.FC<ScrollModelCanvasProps> = ({
  modelPath,
  nextModelPath,
  scale = 1.2,
  initialRotation = [0, 0, 0],
  accentColor = '#10B981',
  className = 'w-full h-full',
  spinSpeed = 0.25,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useAppStore((state) => state.settings.reducedMotion);

  // Adaptive DPR tiered by device screen resolution
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return [1, 1.25] as [number, number];
    if (window.innerWidth < 768) return [1, 1.25] as [number, number];
    return [1, Math.min(1.6, window.devicePixelRatio || 1)] as [number, number];
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Observe element intersection with 180px pre-load margin
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '180px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Predictive Next Section Preloading in idle time
  useEffect(() => {
    if (isVisible && nextModelPath) {
      const timer = window.setTimeout(() => {
        useGLTF.preload(nextModelPath);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isVisible, nextModelPath]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      {isVisible ? (
        <Suspense fallback={<GlobalLoader variant="local3d" label="RESOLVING 3D ASSET" />}>
          <Canvas
            camera={{ position: [0, 0, 3.8], fov: 42 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            dpr={dpr}
            frameloop={reducedMotion ? 'demand' : 'always'}
            className="w-full h-full transition-opacity duration-400"
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 6, 5]} intensity={2.2} />
            <directionalLight position={[-4, 3, 4]} intensity={1.2} />
            <pointLight position={[-3, -2, -3]} intensity={1.5} color={accentColor} />
            <pointLight position={[0, -3, 2]} intensity={0.7} color="#D9C7A3" />
            <ModelRenderer
              modelPath={modelPath}
              scale={scale}
              initialRotation={initialRotation}
              spinSpeed={spinSpeed}
              accentColor={accentColor}
              reducedMotion={reducedMotion}
            />
          </Canvas>
        </Suspense>
      ) : (
        <div className="w-10 h-10 rounded-full border border-emerald-500/20 flex items-center justify-center opacity-30">
          <div className="w-3 h-3 rounded-full bg-emerald-400/40 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default ScrollModelCanvas;
