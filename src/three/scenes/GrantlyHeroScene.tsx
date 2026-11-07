import React, { Suspense } from 'react';
import { StudioLighting } from '../lighting/StudioLighting';
import { CameraRig } from '../animations/CameraRig';
import { CinematicHeroModel, GatewayFallback } from '../models/CinematicHeroModel';

interface GrantlyHeroSceneProps {
  reducedMotion?: boolean;
}

export const GrantlyHeroScene: React.FC<GrantlyHeroSceneProps> = ({ reducedMotion = false }) => {
  return (
    <>
      <StudioLighting />
      <CameraRig reducedMotion={reducedMotion}>
        <Suspense fallback={<GatewayFallback reducedMotion={reducedMotion} />}>
          <CinematicHeroModel reducedMotion={reducedMotion} />
        </Suspense>
      </CameraRig>
    </>
  );
};
