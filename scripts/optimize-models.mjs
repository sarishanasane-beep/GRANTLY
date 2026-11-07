import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dedup, prune, resample, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputDir = path.join(rootDir, 'public', 'models');
const outputDir = path.join(rootDir, 'public', 'models', 'optimized');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const modelConfigs = [
  {
    name: 'sphere.glb',
    isHero: true,
    maxTextureSize: 2048,
    simplifyRatio: 0.8,
    tolerance: 0.00005,
    quality: 88,
  },
  {
    name: 'gateway.glb',
    isHero: true,
    maxTextureSize: 2048,
    simplifyRatio: 0.4,
    tolerance: 0.0001,
    quality: 85,
  },
  {
    name: 'certificate.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.25,
    tolerance: 0.0001,
    quality: 84,
  },
  {
    name: 'medallion.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.25,
    tolerance: 0.0001,
    quality: 84,
  },
  {
    name: 'folder.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.12,
    tolerance: 0.0001,
    quality: 84,
  },
  {
    name: 'book.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.12,
    tolerance: 0.0001,
    quality: 84,
  },
  {
    name: 'cap.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.15,
    tolerance: 0.0001,
    quality: 84,
  },
  {
    name: 'pillar.glb',
    isHero: false,
    maxTextureSize: 1024,
    simplifyRatio: 0.25,
    tolerance: 0.0001,
    quality: 84,
  },
];

async function optimizeModels() {
  console.log('=== OPTIMIZING ALL 8 MESHY GLB MODELS ===\n');
  await MeshoptSimplifier.ready;

  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const results = [];

  for (const cfg of modelConfigs) {
    const inputPath = path.join(inputDir, cfg.name);
    const outputPath = path.join(outputDir, cfg.name);

    if (!fs.existsSync(inputPath)) {
      console.warn(`Skipping missing input: ${inputPath}`);
      continue;
    }

    const origBytes = fs.statSync(inputPath).size;
    console.log(`Processing ${cfg.name} (Original: ${(origBytes / (1024 * 1024)).toFixed(2)} MB)...`);

    const doc = await io.read(inputPath);

    // 1. Geometry Cleanup & Simplification
    console.log(`  Applying geometry cleanup & simplification (ratio: ${cfg.simplifyRatio})...`);
    if (cfg.simplifyRatio < 1.0) {
      await doc.transform(
        weld({ tolerance: cfg.tolerance }),
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: cfg.simplifyRatio,
          error: 0.0005,
        }),
        dedup(),
        resample(),
        prune()
      );
    } else {
      await doc.transform(
        weld({ tolerance: cfg.tolerance }),
        dedup(),
        resample(),
        prune()
      );
    }

    // 2. Texture Resizing & Compression
    const textures = doc.getRoot().listTextures();
    console.log(`  Optimizing ${textures.length} embedded textures...`);

    for (const tex of textures) {
      const buffer = tex.getImage();
      if (!buffer) continue;

      try {
        const meta = await sharp(buffer).metadata();
        const targetMax = cfg.maxTextureSize;

        let pipeline = sharp(buffer);
        if (meta.width > targetMax || meta.height > targetMax) {
          pipeline = pipeline.resize(targetMax, targetMax, { fit: 'inside' });
        }

        const optimizedBuffer = await pipeline
          .jpeg({ quality: cfg.quality, mozjpeg: true })
          .toBuffer();

        tex.setImage(optimizedBuffer);
        tex.setMimeType('image/jpeg');
      } catch (err) {
        console.warn(`    Failed to optimize texture in ${cfg.name}:`, err.message);
      }
    }

    // 3. Write Optimized Model
    await io.write(outputPath, doc);
    const newBytes = fs.statSync(outputPath).size;
    const reductionPercent = (((origBytes - newBytes) / origBytes) * 100).toFixed(1);

    results.push({
      name: cfg.name,
      originalMb: (origBytes / (1024 * 1024)).toFixed(2),
      optimizedMb: (newBytes / (1024 * 1024)).toFixed(2),
      reductionPercent: `${reductionPercent}%`,
      savedMb: ((origBytes - newBytes) / (1024 * 1024)).toFixed(2),
    });

    console.log(`  ✓ ${cfg.name}: ${(origBytes / (1024 * 1024)).toFixed(2)} MB -> ${(newBytes / (1024 * 1024)).toFixed(2)} MB (-${reductionPercent}%)\n`);
  }

  console.log('=== MODEL OPTIMIZATION COMPLETE ===\n');
  console.table(results);

  const totalOrig = results.reduce((a, b) => a + parseFloat(b.originalMb), 0);
  const totalOpt = results.reduce((a, b) => a + parseFloat(b.optimizedMb), 0);
  console.log(`Total Original: ${totalOrig.toFixed(2)} MB`);
  console.log(`Total Optimized: ${totalOpt.toFixed(2)} MB`);
  console.log(`Total Savings: ${(totalOrig - totalOpt).toFixed(2)} MB (-${(((totalOrig - totalOpt) / totalOrig) * 100).toFixed(1)}%)`);

  fs.writeFileSync(path.join(rootDir, 'model-optimization-results.json'), JSON.stringify({ results, totalOrig, totalOpt }, null, 2));
}

optimizeModels().catch((err) => {
  console.error('Optimization error:', err);
  process.exit(1);
});
