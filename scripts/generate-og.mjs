#!/usr/bin/env node
/**
 * @cw/core – OG Image Generator
 *
 * Generates a 1200x630 OG image (PNG, optimized) from site data.
 * Text is rendered via SVG → sharp (no AI, no typos).
 *
 * Usage from customer repo:
 *   node node_modules/@cw/core/scripts/generate-og.mjs \
 *     --name "Steller Sanierungen" \
 *     --tagline "Ein Ansprechpartner. Komplette Sanierung." \
 *     --cta "Kostenlose Erstbesichtigung anfragen" \
 *     --domain "steller-sanierungen.com" \
 *     --primary "#1D1E3B" \
 *     --accent "#DE1668" \
 *     --out public/og/default.png
 *
 * Or with --logo to composite a logo SVG on top:
 *     --logo public/logo.svg
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    args[key] = argv[i + 1];
  }
  return args;
}

const args = parseArgs(process.argv);

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
  process.exit(1);
}

// Escape XML special chars in text
function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Split long text into lines (max ~30 chars per line for OG readability)
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

// Build name lines (large title, may wrap)
const nameLines = wrapText(name, 24);
const nameY = 260;
const nameLineHeight = 90;
const nameSvg = nameLines
  .map((line, i) => `  <text x="600" y="${nameY + i * nameLineHeight}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="#ffffff">${esc(line)}</text>`)
  .join('\n');

// Tagline position (below name)
const taglineY = nameY + nameLines.length * nameLineHeight + 10;
const taglineLines = tagline ? wrapText(tagline, 40) : [];
const taglineSvg = taglineLines
  .map((line, i) => `  <text x="600" y="${taglineY + i * 45}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="32" text-anchor="middle" fill="${accent}">${esc(line)}</text>`)
  .join('\n');

// CTA button (pill shape with accent color)
const ctaText = esc(cta);
const ctaCharWidth = cta.length * 11;
const ctaPadding = 48;
const ctaWidth = ctaCharWidth + ctaPadding * 2;
const ctaHeight = 48;
const ctaX = 600 - ctaWidth / 2;
const ctaY = taglineY + taglineLines.length * 45 + 30;
const ctaSvg = `  <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="24" fill="${accent}"/>
  <text x="600" y="${ctaY + 32}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="20" font-weight="600" text-anchor="middle" fill="#ffffff">${ctaText}</text>`;

// Domain at bottom
const domainSvg = domain
  ? `  <text x="600" y="600" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" text-anchor="middle" fill="rgba(255,255,255,0.45)">${esc(domain)}</text>`
  : '';

// Accent bar at top
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${primary}"/>
  <rect width="1200" height="6" fill="${accent}"/>
${nameSvg}
${taglineSvg}
${ctaSvg}
${domainSvg}
</svg>`;

// Generate
mkdirSync(dirname(outPath), { recursive: true });

let pipeline = sharp(Buffer.from(svg)).png({ quality: 85, compressionLevel: 9 });

// Composite logo if provided
if (logoPath) {
  try {
    const logoBuffer = readFileSync(logoPath);
    // Resize logo to fit nicely (max 120px height, centered top area)
    const resizedLogo = await sharp(logoBuffer)
      .resize({ height: 80, fit: 'inside' })
      .toBuffer();

    pipeline = sharp(Buffer.from(svg))
      .composite([{
        input: resizedLogo,
        top: 40,
        left: 540, // roughly centered for ~120px wide logo
        gravity: 'northwest',
      }])
      .png({ quality: 85, compressionLevel: 9 });
  } catch (e) {
    console.warn(`⚠ Logo nicht gefunden (${logoPath}), OG-Image ohne Logo generiert.`);
  }
}

const info = await pipeline.toFile(outPath);
const sizeKB = Math.round(info.size / 1024);
console.log(`✓ OG-Image generiert: ${outPath} (${info.width}x${info.height}, ${sizeKB} kB)`);
