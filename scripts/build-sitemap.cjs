#!/usr/bin/env node

/**
 * build-sitemap.cjs
 *
 * Reads device IDs from src/lib/data/seed.ts and generates public/sitemap.xml.
 * Run via: node scripts/build-sitemap.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://siliconrank.cyopsys.com';
const SEED_PATH = path.resolve(__dirname, '..', 'src', 'lib', 'data', 'seed.ts');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

// ---------------------------------------------------------------------------
// 1. Extract deviceIds from seed.ts
// ---------------------------------------------------------------------------

const seedContent = fs.readFileSync(SEED_PATH, 'utf-8');

// Match lines like:    deviceId: 'nvidia-rtx-5090',
const deviceIdRegex = /deviceId:\s*'([^']+)'/g;
const deviceIds = new Set();
let match;

while ((match = deviceIdRegex.exec(seedContent)) !== null) {
  deviceIds.add(match[1]);
}

if (deviceIds.size === 0) {
  console.error('ERROR: No deviceIds found in', SEED_PATH);
  process.exit(1);
}

console.log(`Found ${deviceIds.size} device IDs in seed.ts`);

// ---------------------------------------------------------------------------
// 2. Extract vendorIds for vendor pages (optional enhancement)
// ---------------------------------------------------------------------------

const vendorIdRegex = /vendorId:\s*'([^']+)'/g;
const vendorIds = new Set();
while ((match = vendorIdRegex.exec(seedContent)) !== null) {
  // vendorIds appear in vendors array AND inside devices; we just need unique ones
  // but we only want the "canonical" vendor IDs from the vendors array
}
// Re-read just the vendors section for clean vendor IDs
const vendorsSection = seedContent.match(/export const vendors: Vendor\[\]\s*=\s*\[([\s\S]*?)\];/);
if (vendorsSection) {
  const vendorMatch = /vendorId:\s*'([^']+)'/g;
  while ((match = vendorMatch.exec(vendorsSection[1])) !== null) {
    vendorIds.add(match[1]);
  }
}

// ---------------------------------------------------------------------------
// 3. Build the sitemap
// ---------------------------------------------------------------------------

const today = new Date().toISOString().split('T')[0];

function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urls = [];

// Static pages
const staticPages = [
  { path: '/',             changefreq: 'daily',   priority: '1.0' },
  { path: '/browse',       changefreq: 'daily',   priority: '0.9' },
  { path: '/compare',      changefreq: 'weekly',  priority: '0.8' },
  { path: '/charts',       changefreq: 'weekly',  priority: '0.8' },
  { path: '/studio',       changefreq: 'weekly',  priority: '0.7' },
  { path: '/tools',        changefreq: 'monthly', priority: '0.7' },
  { path: '/reports',      changefreq: 'weekly',  priority: '0.6' },
  { path: '/docs',         changefreq: 'monthly', priority: '0.5' },
];

for (const page of staticPages) {
  urls.push(urlEntry(`${SITE_URL}${page.path}`, page.changefreq, page.priority));
}

// Device pages - high value, many pages
const sortedDeviceIds = [...deviceIds].sort();
for (const id of sortedDeviceIds) {
  urls.push(urlEntry(
    `${SITE_URL}/device/${encodeURIComponent(id)}`,
    'weekly',
    '0.7',
  ));
}

// ---------------------------------------------------------------------------
// 4. Write the XML
// ---------------------------------------------------------------------------

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');

const totalUrls = staticPages.length + sortedDeviceIds.length;
console.log(`Sitemap generated: ${OUTPUT_PATH}`);
console.log(`  Static pages: ${staticPages.length}`);
console.log(`  Device pages:  ${sortedDeviceIds.length}`);
console.log(`  Total URLs:    ${totalUrls}`);
