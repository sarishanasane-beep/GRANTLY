import * as THREE from 'three';

/**
 * GRANTLY Standard Procedural Materials
 * Forest Green, Emerald Glass, Champagne Gold, and Obsidian Crystal
 */

export const emeraldMetalMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#10b981'),
  metalness: 0.85,
  roughness: 0.2,
  wireframe: false,
});

export const champagneGoldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#e6ca65'),
  metalness: 0.9,
  roughness: 0.25,
});

export const obsidianCoreMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#040d0a'),
  metalness: 0.5,
  roughness: 0.1,
});

export const wireframeAccentMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#34d399'),
  wireframe: true,
  transparent: true,
  opacity: 0.35,
});
