#!/usr/bin/env node
/**
 * Build the OpenGraph share image (1200x630) from the hero source.
 *
 * Per Plan 06-01 D-02: pre-generate + commit a stable URL at /og-card.jpg.
 * Astro `getImage()` is intentionally NOT used here — its hashed filenames
 * change every build and would break social-platform image caches.
 *
 * Re-run with: npm run build:og-card
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const SRC = resolve(projectRoot, 'src/assets/placeholder/hero.jpg');
const DST = resolve(projectRoot, 'public/og-card.jpg');

const TARGET_W = 1200;
const TARGET_H = 630;
const QUALITY = 82; // RESEARCH §6 budget — keep under 300 KB.

const info = await sharp(SRC)
  .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: QUALITY, mozjpeg: true })
  .toFile(DST);

const bytes = statSync(DST).size;
console.log(`Wrote ${DST}`);
console.log(`  dimensions: ${info.width}x${info.height}`);
console.log(`  format:     ${info.format}`);
console.log(`  bytes:      ${bytes} (${(bytes / 1024).toFixed(1)} KB)`);

if (bytes > 300 * 1024) {
  console.error(`FAIL: og-card.jpg exceeds 300 KB budget (${bytes} bytes)`);
  process.exit(1);
}
