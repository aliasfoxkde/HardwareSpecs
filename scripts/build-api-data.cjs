/**
 * Build script: bundles the seed data + normalization + computed metrics
 * into a single JSON file at mcp-server/data.json for the MCP server.
 *
 * Uses esbuild (via npx) to bundle TypeScript sources (resolving @/ aliases),
 * then executes the bundle to write JSON output.
 *
 * Handles pre-existing syntax issues in seed.ts by patching them before bundling.
 *
 * Usage: node scripts/build-api-data.cjs
 */

const { writeFileSync, mkdirSync, unlinkSync, readFileSync } = require('fs');
const { resolve, join } = require('path');
const { execSync } = require('child_process');

const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'mcp-server');
const OUT_JSON = join(OUT_DIR, 'data.json');

// 1. Ensure output directory exists
mkdirSync(OUT_DIR, { recursive: true });

// 2. Read the seed file and patch known syntax issues
const SEED_PATH = resolve(ROOT, 'src/lib/data/seed.ts');
const PATCHED_SEED = join(OUT_DIR, '_seed-patched.ts');

console.log('Patching seed data syntax...');
let seedContent = readFileSync(SEED_PATH, 'utf-8');

// Fix missing commas in families array:
// Pattern: "}  {" becomes "},  {"
// Pattern: "status: 'active' }\n  { familyId:" becomes "status: 'active' },\n  { familyId:"
// This handles cases where a closing brace is followed by a new object without a comma
seedContent = seedContent.replace(
  /status: 'active' \}\n(\s+)\{ familyId:/g,
  "status: 'active' },\n$1{ familyId:"
);

// Also fix the orphaned device data: the devices array closes at ]; but then
// there are device entries that follow. We need to move them back into the array.
// Strategy: find the first "];" after the devices export, then find the "export const sources"
// line, and move everything between them (the orphaned data) before the "];".

// Find devices array start
const devicesExportMatch = seedContent.match(/export const devices: DeviceVariant\[\] = \[/);
if (!devicesExportMatch) {
  console.error('ERROR: Could not find devices export');
  process.exit(1);
}

// Find the orphaned region: from "];" after devices to "export const sources"
const devicesStart = devicesExportMatch.index;
let searchFrom = devicesStart;

// Find all "];" occurrences after devices start to find the array closing
// The real closing should be followed by an empty line and then "//" comment or "export"
const lines = seedContent.split('\n');
let devicesCloseLine = -1;
let orphanStartLine = -1;
let sourcesExportLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Find "export const sources" line
  if (line.startsWith('export const sources')) {
    sourcesExportLine = i;
    break;
  }
}

if (sourcesExportLine === -1) {
  console.error('ERROR: Could not find sources export');
  process.exit(1);
}

// Find the "];" that closes the devices array - it's the last "];" before sources
// that is followed by a blank line and then the "Sources" section comment
for (let i = sourcesExportLine - 1; i >= 0; i--) {
  if (lines[i].trim() === '];') {
    devicesCloseLine = i;
    break;
  }
}

if (devicesCloseLine === -1) {
  console.error('ERROR: Could not find devices array closing');
  process.exit(1);
}

// Check if there's orphaned data between devicesCloseLine and sourcesExportLine
// Look for the "Sources" section comment
let sourcesCommentLine = -1;
for (let i = devicesCloseLine + 1; i < sourcesExportLine; i++) {
  if (lines[i].trim() === '// Sources' || lines[i].trim() === '// Sources') {
    sourcesCommentLine = i;
    break;
  }
}

// Check if there's device data between devicesCloseLine and the Sources comment
let hasOrphanedData = false;
if (sourcesCommentLine > devicesCloseLine + 3) {
  // There's more than just comment lines between ]; and the Sources section
  for (let i = devicesCloseLine + 1; i < sourcesCommentLine - 2; i++) {
    if (lines[i].trim() && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('---')) {
      hasOrphanedData = true;
      orphanStartLine = i;
      break;
    }
  }
}

if (hasOrphanedData) {
  console.log(`  Found orphaned device data between lines ${devicesCloseLine + 2} and ${sourcesCommentLine}`);

  // Extract orphaned content (the actual device entries, not the comment headers)
  let orphanContent = lines.slice(orphanStartLine, sourcesCommentLine - 2).join('\n');

  // Fix the orphaned entries' formatting:
  // They have the pattern: "  { deviceId: '...', familyId: '...', ...,\nprocessNm: 4,"
  // Fix by adding proper indentation to all lines after the first
  orphanContent = orphanContent.replace(
    /^(  \{ deviceId:.*?\n)([\s\S]*?)(\s*\},?\s*)$/gm,
    (match, firstLine, body, closing) => {
      // Add 4-space indent to each property line
      const fixedBody = body
        .split('\n')
        .map(l => {
          const trimmed = l.trim();
          if (!trimmed) return '';
          // Skip lines that are already properly indented or are just "},"
          if (trimmed.startsWith('},') || trimmed === '}') return '  ' + trimmed;
          return '    ' + trimmed + ',';
        })
        .filter(l => l !== '')
        .join('\n');
      return firstLine + fixedBody + '\n  },';
    }
  );

  // Remove the orphaned region from the file and insert it before "];"
  const beforeOrphan = lines.slice(0, orphanStartLine).join('\n');
  const afterOrphan = lines.slice(sourcesCommentLine - 2).join('\n');

  // Insert the fixed orphaned entries before the "];"
  const closeBracket = '\n];';
  const beforeClose = beforeOrphan.slice(0, beforeOrphan.lastIndexOf('];'));
  seedContent = beforeClose + '\n' + orphanContent + '\n];\n' + afterOrphan;
}

// Write the patched seed file
writeFileSync(PATCHED_SEED, seedContent, 'utf-8');

// 3. Create the bundle entry point
const BUNDLE_ENTRY = join(OUT_DIR, '_bundle-entry.ts');
writeFileSync(BUNDLE_ENTRY, `
import {
  vendors,
  families,
  devices,
  sources,
  benchmarkTypes,
  benchmarks,
  specs,
  prices,
} from '${PATCHED_SEED.replace(/\\/g, '/')}';

export {
  vendors,
  families,
  devices,
  sources,
  benchmarkTypes,
  benchmarks,
  specs,
  prices,
};

export { computeEffectiveInt8Tops, computeDataCompleteness } from '@/lib/normalization';
`);

// 4. Create the execution script that computes metrics and writes JSON
const EXEC_SCRIPT = join(OUT_DIR, '_exec.cjs');
writeFileSync(EXEC_SCRIPT, `
const {
  vendors,
  families,
  devices,
  sources,
  benchmarkTypes,
  benchmarks,
  specs,
  prices,
  computeEffectiveInt8Tops,
  computeDataCompleteness,
} = require('./_bundle.cjs');

const vendorMap = new Map(vendors.map(v => [v.vendorId, v]));
const familyMap = new Map(families.map(f => [f.familyId, f]));

function getLatestPrice(deviceId) {
  const dp = prices.filter(p => p.deviceId === deviceId);
  if (dp.length === 0) return null;
  const priority = { new: 0, msrp: 1, used: 2 };
  dp.sort((a, b) => (priority[a.condition] ?? 3) - (priority[b.condition] ?? 3));
  return dp[0].priceUsd;
}

function getTopBenchmark(deviceId) {
  const db = benchmarks.filter(b => b.deviceId === deviceId);
  if (db.length === 0) return null;
  return db.reduce((best, b) => b.rawScore > best.score
    ? { score: b.rawScore, type: b.benchmarkTypeId }
    : best,
    { score: db[0].rawScore, type: db[0].benchmarkTypeId });
}

const allEffectiveInt8 = computeEffectiveInt8Tops(specs);

const metricsMap = new Map();
for (const device of devices) {
  const deviceSpecs = specs.filter(s => s.deviceId === device.deviceId);
  const deviceBenchmarks = benchmarks.filter(b => b.deviceId === device.deviceId);
  const devicePrices = prices.filter(p => p.deviceId === device.deviceId);
  const price = getLatestPrice(device.deviceId);
  const topBench = getTopBenchmark(device.deviceId);
  const effective = allEffectiveInt8.get(device.deviceId);
  const completeness = computeDataCompleteness(device, deviceBenchmarks, deviceSpecs, devicePrices);

  const fp16Spec = deviceSpecs.find(s => s.fp16Tflops != null);
  const fp32Spec = deviceSpecs.find(s => s.fp32Tflops != null);
  const fp4Spec = deviceSpecs.find(s => s.fp4Tflops != null);
  const fp8Spec = deviceSpecs.find(s => s.fp8Tflops != null);
  const int8Spec = deviceSpecs.find(s => s.int8Tops != null);

  const effectiveTops = effective ? effective.value : (int8Spec ? int8Spec.int8Tops : 0);

  metricsMap.set(device.deviceId, {
    deviceId: device.deviceId,
    effectiveInt8Tops: effectiveTops,
    effectiveInt8TopsConfidence: effective ? effective.confidence : 0.5,
    topsPerDollar: price && effectiveTops > 0 ? Math.round((effectiveTops / price) * 100) / 100 : null,
    topsPerWatt: device.tdpWatts && effectiveTops > 0 ? Math.round((effectiveTops / device.tdpWatts) * 100) / 100 : null,
    perfPerDollar: price && topBench ? Math.round((topBench.score / price) * 100) / 100 : null,
    perfPerWatt: device.tdpWatts && topBench ? Math.round((topBench.score / device.tdpWatts) * 100) / 100 : null,
    fp16Tflops: fp16Spec ? fp16Spec.fp16Tflops : null,
    fp32Tflops: fp32Spec ? fp32Spec.fp32Tflops : null,
    fp4Tflops: fp4Spec ? fp4Spec.fp4Tflops : null,
    fp8Tflops: fp8Spec ? fp8Spec.fp8Tflops : null,
    dataCompleteness: completeness,
    latestPrice: price,
    tdpWatts: device.tdpWatts || null,
    topBenchmarkScore: topBench ? topBench.score : null,
    topBenchmarkType: topBench ? topBench.type : null,
  });
}

const enrichedDevices = devices.map(d => {
  const family = familyMap.get(d.familyId);
  const vendor = family ? vendorMap.get(family.vendorId) : null;
  const m = metricsMap.get(d.deviceId);
  return {
    ...d,
    vendorName: vendor ? vendor.name : 'Unknown',
    vendorId: vendor ? vendor.vendorId : '',
    categoryName: family ? family.category : 'Unknown',
    familyName: family ? family.familyName : 'Unknown',
    architecture: family ? family.architecture : '',
    status: family ? family.status : 'active',
    metrics: m || null,
  };
});

const benchmarksByDevice = {};
for (const b of benchmarks) {
  if (!benchmarksByDevice[b.deviceId]) benchmarksByDevice[b.deviceId] = [];
  benchmarksByDevice[b.deviceId].push(b);
}

const specsByDevice = {};
for (const s of specs) {
  if (!specsByDevice[s.deviceId]) specsByDevice[s.deviceId] = [];
  specsByDevice[s.deviceId].push(s);
}

const pricesByDevice = {};
for (const p of prices) {
  if (!pricesByDevice[p.deviceId]) pricesByDevice[p.deviceId] = [];
  pricesByDevice[p.deviceId].push(p);
}

const output = {
  _meta: {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  },
  vendors,
  families,
  devices: enrichedDevices,
  benchmarks,
  specs,
  prices,
  sources,
  benchmarkTypes,
  benchmarksByDevice,
  specsByDevice,
  pricesByDevice,
  metrics: Object.fromEntries(metricsMap),
};

process.stdout.write(JSON.stringify(output, null, 2));
`);

// 5. Bundle TypeScript sources using esbuild (via npx)
console.log('Bundling TypeScript sources...');
try {
  execSync(
    `npx esbuild "${BUNDLE_ENTRY}" ` +
    `--bundle --format=cjs --platform=node ` +
    `--outfile="${join(OUT_DIR, '_bundle.cjs')}" ` +
    `--alias:@=${resolve(ROOT, 'src')} ` +
    `--define:process.env.NODE_ENV=\\"production\\" ` +
    `--log-level=warning`,
    { cwd: ROOT, stdio: 'pipe', timeout: 30000 }
  );
} catch (err) {
  console.error('esbuild bundle failed:', err.stderr ? err.stderr.toString() : err.message);
  cleanup();
  process.exit(1);
}

// 6. Execute the bundle to produce JSON
console.log('Computing metrics...');
let jsonOutput;
try {
  jsonOutput = execSync(`node "${EXEC_SCRIPT}"`, {
    cwd: ROOT,
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 30000,
  });
} catch (err) {
  console.error('Execution failed:', err.stderr ? err.stderr.toString() : err.message);
  cleanup();
  process.exit(1);
}

// 7. Write output
writeFileSync(OUT_JSON, jsonOutput, 'utf-8');

// 8. Clean up temp files
cleanup();

// 9. Report stats
const data = JSON.parse(jsonOutput);
console.log('MCP data built successfully:');
console.log(`  Devices:     ${data.devices.length}`);
console.log(`  Vendors:    ${data.vendors.length}`);
console.log(`  Families:   ${data.families.length}`);
console.log(`  Benchmarks: ${data.benchmarks.length}`);
console.log(`  Specs:      ${data.specs.length}`);
console.log(`  Prices:     ${data.prices.length}`);
console.log(`  Output:     ${OUT_JSON}`);
console.log(`  Size:       ${(Buffer.byteLength(jsonOutput, 'utf-8') / 1024).toFixed(1)} KB`);

function cleanup() {
  for (const f of [join(OUT_DIR, '_bundle.cjs'), EXEC_SCRIPT, BUNDLE_ENTRY, PATCHED_SEED]) {
    try { unlinkSync(f); } catch (_) { /* ignore */ }
  }
}
