import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSvg = join(__dirname, '../client/public/logo.svg');
const outputDir = join(__dirname, '../doc/public');

// Create output directory
mkdirSync(outputDir, { recursive: true });

console.log('📦 Generating favicons from SVG...\n');

const svg = readFileSync(inputSvg);

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

// Generate PNG favicons
for (const { name, size } of sizes) {
  const outputPath = join(outputDir, name);
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅ Generated ${name} (${size}x${size})`);
}

// Generate .ico file from 16x16 and 32x32 PNGs
console.log('\n🔨 Generating favicon.ico...');
const buf = await pngToIco([
  join(outputDir, 'favicon-16x16.png'),
  join(outputDir, 'favicon-32x32.png')
]);
writeFileSync(join(outputDir, 'favicon.ico'), buf);
console.log('✅ Generated favicon.ico\n');

console.log(`✨ All favicons generated in ${outputDir}`);
