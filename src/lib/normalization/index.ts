/**
 * Normalization engine for SiliconRank hardware intelligence platform.
 *
 * Transforms raw benchmark data into normalized 0-1 percentile scores,
 * category scores, composite use-case scores, and derived metrics
 * (perf/dollar, perf/watt, effective INT8 TOPS, data completeness).
 */

import type {
  BenchmarkResult,
  BenchmarkType,
  DeviceVariant,
  PriceSnapshot,
  SpecSnapshot,
  WorkloadType,
} from '../../types/index.ts';

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

export type CompositeType =
  | 'general_compute'
  | 'ai_inference'
  | 'desktop_efficiency'
  | 'edge_ai'
  | 'best_bang_for_buck';

export interface CompositeWeights {
  cpu_single?: number;
  cpu_multi?: number;
  gpu_raster?: number;
  gpu_compute?: number;
  ai_inference?: number;
  memory?: number;
  storage?: number;
  efficiency?: number;
}

// ---------------------------------------------------------------------------
// Default composite weights
// ---------------------------------------------------------------------------

const COMPOSITE_WEIGHT_PRESETS: Record<CompositeType, CompositeWeights> = {
  general_compute: {
    cpu_single: 0.15,
    cpu_multi: 0.15,
    gpu_raster: 0.15,
    gpu_compute: 0.15,
    ai_inference: 0.15,
    memory: 0.15,
    storage: 0.1,
  },
  ai_inference: {
    ai_inference: 0.5,
    gpu_compute: 0.2,
    cpu_single: 0.1,
    cpu_multi: 0.05,
    memory: 0.15,
  },
  desktop_efficiency: {
    cpu_single: 0.15,
    cpu_multi: 0.1,
    gpu_raster: 0.2,
    gpu_compute: 0.1,
    ai_inference: 0.1,
    memory: 0.2,
    storage: 0.15,
  },
  edge_ai: {
    ai_inference: 0.4,
    cpu_single: 0.1,
    cpu_multi: 0.1,
    memory: 0.2,
    efficiency: 0.2,
  },
  best_bang_for_buck: {
    cpu_single: 0.15,
    cpu_multi: 0.15,
    gpu_raster: 0.15,
    gpu_compute: 0.15,
    ai_inference: 0.15,
    memory: 0.15,
    storage: 0.1,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a number to [0, 1]. */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Weighted average of 0-1 category scores given an arbitrary weights object. */
function weightedAverage(
  categoryScores: Record<string, number>,
  weights: CompositeWeights,
): number {
  let numerator = 0;
  let denominator = 0;
  for (const key of Object.keys(weights) as Array<keyof CompositeWeights>) {
    const w = weights[key];
    if (w === undefined || w <= 0) continue;
    const v = categoryScores[key];
    if (v === undefined || isNaN(v)) continue;
    numerator += w * v;
    denominator += w;
  }
  return denominator > 0 ? clamp01(numerator / denominator) : 0;
}

// ---------------------------------------------------------------------------
// normalizeWithinBenchmark
// ---------------------------------------------------------------------------

/**
 * Normalize raw benchmark scores to 0-1 percentile within a benchmark type.
 *
 * Min-max normalization: (score - min) / (max - min).
 * - Single result returns 0.5.
 * - All identical scores return 0.5.
 */
export function normalizeWithinBenchmark(
  results: BenchmarkResult[],
  benchmarkTypeId: string,
): Map<string, number> {
  const map = new Map<string, number>();

  const filtered = results.filter(
    (r) => r.benchmarkTypeId === benchmarkTypeId,
  );

  if (filtered.length === 0) return map;

  const scores = filtered.map((r) => r.rawScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;

  for (const result of filtered) {
    if (range === 0 || filtered.length === 1) {
      map.set(result.deviceId, 0.5);
    } else {
      map.set(result.deviceId, clamp01((result.rawScore - min) / range));
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// computeCategoryScores
// ---------------------------------------------------------------------------

/**
 * Compute category scores (cpu_single, cpu_multi, gpu_raster, gpu_compute,
 * ai_inference, ai_training, memory, storage, efficiency) for each device.
 *
 * Each category score is the weighted average of normalized benchmark scores
 * belonging to that category (weighted by `weightHint` on the benchmark type).
 */
export function computeCategoryScores(
  deviceBenchmarks: Map<string, BenchmarkResult[]>,
  benchmarkTypes: BenchmarkType[],
): Map<string, Record<WorkloadType, number>> {
  const result = new Map<string, Record<WorkloadType, number>>();

  // Group benchmark types by workload category
  const typesByCategory = new Map<WorkloadType, BenchmarkType[]>();
  for (const bt of benchmarkTypes) {
    const existing = typesByCategory.get(bt.category) ?? [];
    existing.push(bt);
    typesByCategory.set(bt.category, existing);
  }

  // Collect all results for each benchmark type across all devices so we can
  // normalize within benchmark type.
  const allResults = Array.from(deviceBenchmarks.values()).flat();

  for (const [deviceId, benchmarks] of deviceBenchmarks) {
    const scores: Partial<Record<WorkloadType, number>> = {};

    for (const [category, types] of typesByCategory) {
      const typeIds = new Set(types.map((t) => t.benchmarkTypeId));
      const matching = benchmarks.filter((b) =>
        typeIds.has(b.benchmarkTypeId),
      );

      if (matching.length === 0) continue;

      // Normalize each benchmark type, then weight-average across types
      // that belong to this category.
      let numerator = 0;
      let denominator = 0;

      for (const bt of types) {
        const btResults = matching.filter(
          (b) => b.benchmarkTypeId === bt.benchmarkTypeId,
        );
        if (btResults.length === 0) continue;

        // Normalize within this benchmark type using all devices' results
        const normalized = normalizeWithinBenchmark(
          allResults,
          bt.benchmarkTypeId,
        );

        // Use the device's normalized value for this benchmark type
        const val = normalized.get(deviceId);
        if (val === undefined) continue;

        // If multiple results exist for same device+type, average them
        // (each result maps to the same normalized value, so the average is val)
        const avg = val;
        const weight = bt.weightHint > 0 ? bt.weightHint : 1;
        numerator += weight * avg;
        denominator += weight;
      }

      if (denominator > 0) {
        scores[category] = clamp01(numerator / denominator);
      }
    }

    result.set(deviceId, scores as Record<WorkloadType, number>);
  }

  return result;
}

// ---------------------------------------------------------------------------
// computeCompositeScores
// ---------------------------------------------------------------------------

/**
 * Compute composite scores for different use-case views.
 *
 * Each composite type applies a preset weighting to the category scores.
 * Custom weights can override individual fields.
 */
export function computeCompositeScores(
  categoryScores: Map<string, Record<WorkloadType, number>>,
  weights?: Partial<Record<CompositeType, CompositeWeights>>,
): Map<string, Record<CompositeType, number>> {
  const result = new Map<string, Record<CompositeType, number>>();

  const compositeTypes: CompositeType[] = [
    'general_compute',
    'ai_inference',
    'desktop_efficiency',
    'edge_ai',
    'best_bang_for_buck',
  ];

  for (const [deviceId, categories] of categoryScores) {
    const composites = {} as Record<CompositeType, number>;

    for (const ct of compositeTypes) {
      const preset = { ...COMPOSITE_WEIGHT_PRESETS[ct] };
      // Merge custom overrides
      if (weights?.[ct]) {
        Object.assign(preset, weights[ct]);
      }
      composites[ct] = weightedAverage(categories, preset);
    }

    result.set(deviceId, composites);
  }

  return result;
}

// ---------------------------------------------------------------------------
// computePerfPerDollar
// ---------------------------------------------------------------------------

/**
 * Compute performance per dollar for each device.
 *
 * For each device, picks the lowest available "new" or "msrp" price.
 * perfPerDollar = score / priceUsd.
 * Devices with no valid price are excluded.
 */
export function computePerfPerDollar(
  scores: Map<string, number>,
  prices: PriceSnapshot[],
): Map<string, number> {
  const result = new Map<string, number>();

  // Best price per device: prefer new > msrp > used
  const bestPrice = new Map<string, number>();
  const priority: PriceSnapshot['condition'][] = ['new', 'msrp', 'used'];

  for (const p of prices) {
    const current = bestPrice.get(p.deviceId);
    if (current === undefined) {
      bestPrice.set(p.deviceId, p.priceUsd);
    } else {
      const currentPriority = priority.indexOf(
        prices.find((pr) => pr.deviceId === p.deviceId && pr.priceUsd === current)?.condition ?? 'used',
      );
      const newPriority = priority.indexOf(p.condition);
      if (newPriority < currentPriority || (newPriority === currentPriority && p.priceUsd < current)) {
        bestPrice.set(p.deviceId, p.priceUsd);
      }
    }
  }

  for (const [deviceId, score] of scores) {
    const price = bestPrice.get(deviceId);
    if (price === undefined || price <= 0) continue;
    result.set(deviceId, score / price);
  }

  return result;
}

// ---------------------------------------------------------------------------
// computePerfPerWatt
// ---------------------------------------------------------------------------

/**
 * Compute performance per watt for each device.
 *
 * perfPerWatt = score / tdpWatts.
 * Devices with no TDP reported are excluded.
 */
export function computePerfPerWatt(
  scores: Map<string, number>,
  devices: DeviceVariant[],
): Map<string, number> {
  const result = new Map<string, number>();

  const tdpMap = new Map<string, number>();
  for (const d of devices) {
    if (d.tdpWatts !== undefined && d.tdpWatts > 0) {
      tdpMap.set(d.deviceId, d.tdpWatts);
    }
  }

  for (const [deviceId, score] of scores) {
    const tdp = tdpMap.get(deviceId);
    if (tdp === undefined) continue;
    result.set(deviceId, score / tdp);
  }

  return result;
}

// ---------------------------------------------------------------------------
// computeEffectiveInt8Tops
// ---------------------------------------------------------------------------

const DEFAULT_CALIBRATION_FACTOR = 0.6;
const DEFAULT_WORKLOAD_FACTOR = 0.85;
const DEFAULT_RUNTIME_FACTOR = 0.9;
const LOW_BANDWIDTH_THRESHOLD_GBPS = 50;

/**
 * Compute effective INT8 TOPS (modelled).
 *
 * effective = vendor_reported * calibration * workload * memory * runtime
 *
 * Calibration factor defaults to 0.6 (vendors typically overstate by ~40%).
 * Memory factor degrades when memory bandwidth is very low (< 50 GB/s).
 */
export function computeEffectiveInt8Tops(
  specs: SpecSnapshot[],
): Map<string, { value: number; confidence: number; method: 'measured' | 'modelled' }> {
  const result = new Map<
    string,
    { value: number; confidence: number; method: 'measured' | 'modelled' }
  >();

  // Take the latest snapshot per device (by snapshotId ordering)
  const latestPerDevice = new Map<string, SpecSnapshot>();
  for (const s of specs) {
    const existing = latestPerDevice.get(s.deviceId);
    if (!existing || s.snapshotId > existing.snapshotId) {
      latestPerDevice.set(s.deviceId, s);
    }
  }

  for (const [, spec] of latestPerDevice) {
    const vendorTops = spec.int8Tops;
    if (vendorTops === undefined || vendorTops <= 0) continue;

    const calibrationFactor = DEFAULT_CALIBRATION_FACTOR;
    const workloadFactor = DEFAULT_WORKLOAD_FACTOR;
    const runtimeFactor = DEFAULT_RUNTIME_FACTOR;

    // Memory factor: degrade if bandwidth is very low
    let memoryFactor = 1.0;
    if (
      spec.memoryBwGBps !== undefined &&
      spec.memoryBwGBps < LOW_BANDWIDTH_THRESHOLD_GBPS
    ) {
      memoryFactor = 0.7 + 0.3 * (spec.memoryBwGBps / LOW_BANDWIDTH_THRESHOLD_GBPS);
    }

    const effective =
      vendorTops * calibrationFactor * workloadFactor * memoryFactor * runtimeFactor;

    // Confidence reflects how many spec fields we had to fill with defaults
    let confidence = 0.8; // base confidence for modelled estimate
    if (spec.memoryBwGBps !== undefined) confidence += 0.05;
    if (spec.tdpWatts !== undefined) confidence += 0.05;
    confidence = Math.min(confidence, 0.95);

    result.set(spec.deviceId, {
      value: Math.round(effective * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      method: 'modelled',
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// computeDataCompleteness
// ---------------------------------------------------------------------------

/** Fields expected for a "complete" device profile. */
const EXPECTED_BENCHMARK_CATEGORIES = new Set<WorkloadType>([
  'cpu_single',
  'cpu_multi',
  'gpu_raster',
  'gpu_compute',
  'ai_inference',
  'memory',
  'storage',
]);

const EXPECTED_SPEC_FIELDS = ['int8Tops', 'tdpWatts', 'memoryBwGBps'] as const;

/**
 * Compute data completeness percentage for a device.
 *
 * Checks presence of:
 * - Core device fields (processNm, cores, threads, tdpWatts)
 * - Benchmark results across expected categories
 * - Key spec fields (int8Tops, tdpWatts, memoryBwGBps)
 * - Price data
 *
 * Returns a value between 0 and 1.
 */
export function computeDataCompleteness(
  device: DeviceVariant,
  benchmarks: BenchmarkResult[],
  specs: SpecSnapshot[],
  prices: PriceSnapshot[],
): number {
  let filled = 0;
  let total = 0;

  // Core device fields (4 expected)
  total += 4;
  if (device.processNm !== undefined) filled++;
  if (device.cores !== undefined) filled++;
  if (device.threads !== undefined) filled++;
  if (device.tdpWatts !== undefined) filled++;

  // Benchmark categories (7 expected)
  total += EXPECTED_BENCHMARK_CATEGORIES.size;
  const deviceBenchmarks = benchmarks.filter(
    (b) => b.deviceId === device.deviceId,
  );
  const categoriesCovered = new Set<WorkloadType>();
  for (const b of deviceBenchmarks) {
    const btId = b.benchmarkTypeId;
    // We need benchmark type info to map to category, but we don't have it here.
    // Instead, count unique benchmarkTypeId entries (each type maps to a category).
    categoriesCovered.add(btId as unknown as WorkloadType);
  }
  // Approximate: count unique benchmark types as categories covered, capped at expected.
  filled += Math.min(categoriesCovered.size, EXPECTED_BENCHMARK_CATEGORIES.size);

  // Spec fields (3 expected)
  total += EXPECTED_SPEC_FIELDS.length;
  const latestSpec = specs
    .filter((s) => s.deviceId === device.deviceId)
    .sort((a, b) => b.snapshotId.localeCompare(a.snapshotId))[0];
  if (latestSpec) {
    for (const field of EXPECTED_SPEC_FIELDS) {
      if (latestSpec[field] !== undefined) filled++;
    }
  }

  // Price data (1 expected)
  total += 1;
  const hasPrice = prices.some((p) => p.deviceId === device.deviceId);
  if (hasPrice) filled++;

  return total > 0 ? filled / total : 0;
}
