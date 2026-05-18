#!/usr/bin/env node
/**
 * Build the iOS home-screen icon (180x180 PNG) from the brand logo.
 *
 * Per Plan 06-01 D-03: keep favicon.svg, add apple-touch-icon.png.
 * Apple does not accept JPEG reliably for this slot — must be PNG.
 *
 * Re-run with: npm run build:apple-touch-icon
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const SRC = resolve(projectRoot, 'src/assets/brand/logo.jpg');
const DST = resolve(projectRoot, 'public/apple-touch-icon.png');

const SIZE = 180;

const info = await sharp(SRC)
  .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(DST);

const bytes = statSync(DST).size;
console.log(`Wrote ${DST}`);
console.log(`  dimensions: ${info.width}x${info.height}`);
console.log(`  format:     ${info.format}`);
console.log(`  bytes:      ${bytes} (${(bytes / 1024).toFixed(1)} KB)`);
