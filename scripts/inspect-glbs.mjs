import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:\\Users\\Priya\\OneDrive\\Documents\\HACKATHON\\frontend arena\\3d model';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.glb'));

console.log(`Found ${files.length} GLB files in ${dir}\n`);

for (const file of files) {
  const filePath = path.join(dir, file);
  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);

  // Read GLB header
  const magic = buffer.toString('utf8', 0, 4);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  if (magic !== 'glTF') {
    console.error(`Invalid GLB: ${file}`);
    continue;
  }

  // Chunk 0 is JSON
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.toString('utf8', 16, 20);
  const jsonData = JSON.parse(buffer.toString('utf8', 20, 20 + chunkLength));

  // Compute geometry metrics
  let totalVertices = 0;
  let totalTriangles = 0;
  let boundingBox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };

  if (jsonData.meshes) {
    for (const mesh of jsonData.meshes) {
      for (const prim of mesh.primitives || []) {
        if (prim.attributes && prim.attributes.POSITION !== undefined) {
          const posAcc = jsonData.accessors[prim.attributes.POSITION];
          totalVertices += posAcc.count;
          if (posAcc.min && posAcc.max) {
            boundingBox.min = boundingBox.min.map((v, i) => Math.min(v, posAcc.min[i]));
            boundingBox.max = boundingBox.max.map((v, i) => Math.max(v, posAcc.max[i]));
          }
        }
        if (prim.indices !== undefined) {
          const idxAcc = jsonData.accessors[prim.indices];
          totalTriangles += idxAcc.count / 3;
        }
      }
    }
  }

  // Materials & Textures
  const materials = (jsonData.materials || []).map(m => {
    const pbr = m.pbrMetallicRoughness || {};
    return {
      name: m.name || 'unnamed',
      baseColorFactor: pbr.baseColorFactor,
      roughnessFactor: pbr.roughnessFactor,
      metallicFactor: pbr.metallicFactor,
      hasBaseColorTex: pbr.baseColorTexture !== undefined,
      hasNormalTex: m.normalTexture !== undefined,
      hasRoughnessTex: pbr.metallicRoughnessTexture !== undefined,
      hasOcclusionTex: m.occlusionTexture !== undefined,
      hasEmissiveTex: m.emissiveTexture !== undefined,
    };
  });

  // Images
  const images = (jsonData.images || []).map(img => ({
    name: img.name || 'unnamed',
    mimeType: img.mimeType,
  }));

  // Animations
  const animations = (jsonData.animations || []).map(a => ({
    name: a.name || 'unnamed',
    channels: a.channels ? a.channels.length : 0,
  }));

  // Size dimensions
  const dims = [
    (boundingBox.max[0] - boundingBox.min[0]).toFixed(3),
    (boundingBox.max[1] - boundingBox.min[1]).toFixed(3),
    (boundingBox.max[2] - boundingBox.min[2]).toFixed(3),
  ];

  console.log(`=======================================================`);
  console.log(`FILE: ${file}`);
  console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
  console.log(`Meshes: ${jsonData.meshes ? jsonData.meshes.length : 0}`);
  console.log(`Vertices: ${totalVertices.toLocaleString()}`);
  console.log(`Triangles: ${Math.round(totalTriangles).toLocaleString()}`);
  console.log(`Bounding Box Dims [X, Y, Z]: [${dims.join(', ')}]`);
  console.log(`Materials (${materials.length}):`, JSON.stringify(materials, null, 2));
  console.log(`Textures/Images (${images.length}):`, JSON.stringify(images));
  console.log(`Animations (${animations.length}):`, JSON.stringify(animations));
  console.log(`=======================================================\n`);
}
