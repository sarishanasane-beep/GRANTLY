import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const modelsDir = path.join(rootDir, 'public', 'models');

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);

const modelFiles = [
  'sphere.glb',
  'gateway.glb',
  'certificate.glb',
  'medallion.glb',
  'folder.glb',
  'book.glb',
  'cap.glb',
  'pillar.glb',
];

for (const name of modelFiles) {
  const filePath = path.join(modelsDir, name);
  const doc = await io.read(filePath);
  const root = doc.getRoot();
  const meshes = root.listMeshes();
  const textures = root.listTextures();
  const materials = root.listMaterials();

  let vertexCount = 0;
  let triangleCount = 0;

  for (const mesh of meshes) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (pos) vertexCount += pos.getCount();
      const indices = prim.getIndices();
      if (indices) triangleCount += indices.getCount() / 3;
      else if (pos) triangleCount += pos.getCount() / 3;
    }
  }

  console.log(`\n=== ${name} ===`);
  console.log(`File Size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Meshes: ${meshes.length}, Materials: ${materials.length}`);
  console.log(`Vertices: ${vertexCount.toLocaleString()}, Triangles: ${Math.round(triangleCount).toLocaleString()}`);
  console.log(`Textures (${textures.length}):`);
  for (const tex of textures) {
    const size = tex.getSize();
    const mime = tex.getMimeType();
    const byteLength = tex.getImage() ? tex.getImage().byteLength : 0;
    console.log(`  - ${tex.getName() || 'unnamed'}: ${size ? `${size[0]}x${size[1]}` : 'unknown'} (${mime}) - ${(byteLength / (1024 * 1024)).toFixed(2)} MB`);
  }
}
