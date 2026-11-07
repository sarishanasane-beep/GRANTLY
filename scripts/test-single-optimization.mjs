import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dedup, prune, resample } from '@gltf-transform/functions';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.join(rootDir, 'public', 'models', 'sphere.glb');
const outputDir = path.join(rootDir, 'public', 'models', 'optimized');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'sphere.glb');

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
console.log('Reading sphere.glb...');
const doc = await io.read(inputPath);

console.log('Running glTF Transform geometry cleanups...');
await doc.transform(
  weld({ tolerance: 0.00005 }),
  dedup(),
  resample(),
  prune()
);

console.log('Resizing textures with sharp (4K -> 2K max)...');
const textures = doc.getRoot().listTextures();
for (const tex of textures) {
  const imgBuffer = tex.getImage();
  if (!imgBuffer) continue;
  const metadata = await sharp(imgBuffer).metadata();
  console.log(`  Texture: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${(imgBuffer.byteLength / 1024).toFixed(1)} KB`);

  if (metadata.width > 2048 || metadata.height > 2048) {
    const resizedBuffer = await sharp(imgBuffer)
      .resize(2048, 2048, { fit: 'inside' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    tex.setImage(resizedBuffer);
    tex.setMimeType('image/jpeg');
    console.log(`    -> Resized to 2048x2048: ${(resizedBuffer.byteLength / 1024).toFixed(1)} KB`);
  }
}

console.log('Writing optimized sphere.glb...');
await io.write(outputPath, doc);

const originalSize = fs.statSync(inputPath).size;
const newSize = fs.statSync(outputPath).size;

console.log(`Original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Optimized: ${(newSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Reduction: ${(((originalSize - newSize) / originalSize) * 100).toFixed(1)}%`);
