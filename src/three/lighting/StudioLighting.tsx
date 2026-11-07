import React from 'react';

export const StudioLighting: React.FC = () => {
  return (
    <>
      {/* Base forest ambient light */}
      <ambientLight intensity={0.65} color="#1F2A1F" />

      {/* Key Directional - Subtle Sage Rim */}
      <directionalLight
        position={[5, 7, 5]}
        intensity={1.8}
        color="#8CA98C"
        castShadow={false}
      />

      {/* Secondary Directional - Warm Champagne Gold Fill */}
      <directionalLight
        position={[-6, -2, -4]}
        intensity={1.2}
        color="#D9C7A3"
      />

      {/* Top soft spotlight for depth */}
      <pointLight position={[0, 5, 2]} intensity={1.0} color="#3E5A3F" distance={15} />

      {/* Subtle bottom accent light - Warm Gold */}
      <pointLight position={[0, -4, 3]} intensity={0.7} color="#B08D57" distance={12} />
    </>
  );
};
