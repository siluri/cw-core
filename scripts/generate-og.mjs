#!/usr/bin/env node
/**
 * @cw/core – OG Image Generator
 *
 * Three modes:
 *
 * 1. Text-based OG (SVG → PNG):
 *   node generate-og.mjs \
 *     --name "Steller Sanierungen" \
 *     --tagline "Ein Ansprechpartner. Komplette Sanierung." \
 *     --cta "Kostenlose Erstbesichtigung anfragen" \
 *     --domain "steller-sanierungen.com" \
 *     --primary "#1D1E3B" --accent "#DE1668" \
 *     --out public/og/default.png
 *
 * 2. Single hero → OG crop:
 *   node generate-og.mjs --from-hero public/images/hero/wertermittlung.webp --out public/og/wertermittlung.webp
 *
 * 3. Batch: all heroes → OG directory:
 *   node generate-og.mjs --from-dir public/images/hero --og-dir public/og
 *
 * Options (all modes):
 *   --quality=N    WebP/PNG quality (default: 80)
 *   --logo path    Composite logo on top (text + from-hero modes)
 */
import { createRequire } from 'module';
import { readFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { dirname, join, extname, basename } from 'path';

// Resolve sharp from the consumer's node_modules (CWD), not from this script's location.
// This is needed because cw-core doesn't depend on sharp directly — consumer repos do.
const require = createRequire(join(process.cwd(), 'node_modules', '.placeholder'));
const sharp = require('sharp');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, val] = arg.split('=');
      args[key.replace(/^--/, '')] = val;
    } else if (arg.startsWith('--') && argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args[arg.replace(/^--/, '')] = argv[++i];
    } else if (arg.startsWith('--')) {
      args[arg.replace(/^--/, '')] = true;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const quality = parseInt(args.quality || '80', 10);

// ─── Mode: Batch hero → OG ───────────────────────────────────────────
if (args['from-dir']) {
  const heroDir = args['from-dir'];
  const ogDir = args['og-dir'] || 'public/og';

  if (!existsSync(heroDir)) {
    console.error(`✗ Hero directory not found: ${heroDir}`);
    process.exit(1);
  }

  mkdirSync(ogDir, { recursive: true });

  const files = readdirSync(heroDir).filter(f => SUPPORTED_EXT.has(extname(f).toLowerCase()));

  if (files.length === 0) {
    console.log(`  ⏭  No images found in ${heroDir}`);
    process.exit(0);
  }

  console.log(`\n  🖼  Generating OG images from ${heroDir} → ${ogDir}\n`);

  let count = 0;
  for (const file of files) {
    const src = join(heroDir, file);
    const outExt = extname(file).toLowerCase() === '.png' ? '.png' : '.webp';
    const dst = join(ogDir, basename(file, extname(file)) + outExt);

    try {
      const info = await cropToOG(src, dst, quality);
      console.log(`   ✅ ${file} → ${basename(dst)} (${Math.round(info.size / 1024)} kB)`);
      count++;
    } catch (e) {
      console.error(`   ❌ ${file}: ${e.message}`);
    }
  }

  console.log(`\n  📊 ${count}/${files.length} OG images generated\n`);
  process.exit(0);
}

// ─── Mode: Single hero → OG ──────────────────────────────────────────
if (args['from-hero']) {
  const heroPath = args['from-hero'];
  const outPath = args.out || `public/og/${basename(heroPath)}`;

  if (!existsSync(heroPath)) {
    console.error(`✗ Hero image not found: ${heroPath}`);
    process.exit(1);
  }

  mkdirSync(dirname(outPath), { recursive: true });

  const info = await cropToOG(heroPath, outPath, quality);
  console.log(`✓ OG-Image: ${outPath} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} kB)`);
  process.exit(0);
}

// ─── Mode: Text-based OG (original) ──────────────────────────────────
const name = args.name || 'Firmenname';
const tagline = args.tagline || '';
const cta = args.cta;
const domain = args.domain || '';
const primary = args.primary || '#1D1E3B';
const accent = args.accent || '#EF7612';
const outPath = args.out || 'public/og/default.png';
const logoPath = args.logo || null;

if (!cta) {
  console.error('✗ --cta ist Pflicht (z.B. --cta "Jetzt anfragen")');
  console.error('');
  console.error('Usage:');
  console.error('  Text OG:  generate-og.mjs --name "..." --cta "..." --out public/og/default.png');
  console.error('  From hero: generate-og.mjs --from-hero public/images/hero/x.webp --out public/og/x.webp');
  console.error('  Batch:    generate-og.mjs --from-dir public/images/hero --og-dir public/og');
  process.exit(1);
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapText(text, maxChars = 30) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const nameLines = wrapText(name, 24);
const nameY = 260;
const nameLineHeight = 90;
const nameSvg = nameLines
  .map((line, i) => `  <text x="600" y="${nameY + i * nameLineHeight}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="#ffffff">${esc(line)}</text>`)
  .join('\n');

const taglineY = nameY + nameLines.length * nameLineHeight + 10;
const taglineLines = tagline ? wrapText(tagline, 40) : [];
const taglineSvg = taglineLines
  .map((line, i) => `  <text x="600" y="${taglineY + i * 45}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="32" text-anchor="middle" fill="${accent}">${esc(line)}</text>`)
  .join('\n');

const ctaText = esc(cta);
const ctaCharWidth = cta.length * 11;
const ctaPadding = 48;
const ctaWidth = ctaCharWidth + ctaPadding * 2;
const ctaHeight = 48;
const ctaX = 600 - ctaWidth / 2;
const ctaY = taglineY + taglineLines.length * 45 + 30;
const ctaSvg = `  <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="24" fill="${accent}"/>
  <text x="600" y="${ctaY + 32}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="20" font-weight="600" text-anchor="middle" fill="#ffffff">${ctaText}</text>`;

const domainSvg = domain
  ? `  <text x="600" y="600" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" text-anchor="middle" fill="rgba(255,255,255,0.45)">${esc(domain)}</text>`
  : '';

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${primary}"/>
  <rect width="1200" height="6" fill="${accent}"/>
${nameSvg}
${taglineSvg}
${ctaSvg}
${domainSvg}
</svg>`;

mkdirSync(dirname(outPath), { recursive: true });

let pipeline = sharp(Buffer.from(svg)).png({ quality: 85, compressionLevel: 9 });

if (logoPath) {
  try {
    const logoBuffer = readFileSync(logoPath);
    const resizedLogo = await sharp(logoBuffer)
      .resize({ height: 80, fit: 'inside' })
      .toBuffer();

    const logoMeta = await sharp(resizedLogo).metadata();
    const logoLeft = Math.round((1200 - logoMeta.width) / 2);

    pipeline = sharp(Buffer.from(svg))
      .composite([{
        input: resizedLogo,
        top: 40,
        left: logoLeft,
      }])
      .png({ quality: 85, compressionLevel: 9 });

    console.log(`  Logo: ${logoPath} (${logoMeta.width}x${logoMeta.height}, left=${logoLeft})`);
  } catch (e) {
    console.warn(`⚠ Logo nicht gefunden (${logoPath}), OG-Image ohne Logo generiert.`);
  }
}

const info = await pipeline.toFile(outPath);
const sizeKB = Math.round(info.size / 1024);
console.log(`✓ OG-Image generiert: ${outPath} (${info.width}x${info.height}, ${sizeKB} kB)`);

// ─── Shared: crop any image to OG dimensions ─────────────────────────
async function cropToOG(src, dst, q = 80) {
  const meta = await sharp(src).metadata();
  const srcW = meta.width;
  const srcH = meta.height;

  // Calculate center crop to 1.905:1 aspect ratio (1200/630)
  const targetRatio = OG_WIDTH / OG_HEIGHT;
  const srcRatio = srcW / srcH;

  let cropW, cropH, cropLeft, cropTop;
  if (srcRatio > targetRatio) {
    // Source is wider — crop sides
    cropH = srcH;
    cropW = Math.round(srcH * targetRatio);
    cropLeft = Math.round((srcW - cropW) / 2);
    cropTop = 0;
  } else {
    // Source is taller — crop top/bottom
    cropW = srcW;
    cropH = Math.round(srcW / targetRatio);
    cropLeft = 0;
    cropTop = Math.round((srcH - cropH) / 2);
  }

  const isWebp = extname(dst).toLowerCase() === '.webp';

  mkdirSync(dirname(dst), { recursive: true });

  return sharp(src)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(OG_WIDTH, OG_HEIGHT)
    [isWebp ? 'webp' : 'png']({ quality: q })
    .toFile(dst);
}
