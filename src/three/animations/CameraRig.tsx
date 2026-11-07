import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  children?: React.ReactNode;
  reducedMotion?: boolean;
}

export const CameraRig: React.FC<CameraRigProps> = ({ children, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.rotation.y = 0;
      groupRef.current.rotation.x = 0;
      return;
    }

    // Subtle pointer parallax response clamped smoothly
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.25;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetX,
      2.5,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      -targetY,
      2.5,
      delta
    );
  });

  return <group ref={groupRef}>{children}</group>;
};
