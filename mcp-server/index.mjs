#!/usr/bin/env node

/**
 * SiliconRank MCP Server
 *
 * A standalone MCP (Model Context Protocol) server for the SiliconRank
 * hardware comparison platform. Exposes device data, metrics, rankings,
 * and comparison tools over stdio using JSON-RPC 2.0.
 *
 * Usage:
 *   node mcp-server/index.mjs
 *
 * MCP Configuration (e.g. Claude Desktop):
 *   {
 *     "mcpServers": {
 *       "siliconrank": {
 *         "command": "node",
 *         "args": ["/path/to/HardwareSpecs/mcp-server/index.mjs"]
 *       }
 *     }
 *   }
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data.json');

if (!existsSync(DATA_PATH)) {
  process.stderr.write(
    `ERROR: MCP data file not found at ${DATA_PATH}\n` +
    `Run: npm run build:api\n`
  );
  process.exit(1);
}

const raw = readFileSync(DATA_PATH, 'utf-8');
const data = JSON.parse(raw);

const { vendors, families, devices, benchmarks, specs, prices, sources, benchmarkTypes } = data;
const { benchmarksByDevice, specsByDevice, pricesByDevice, metrics } = data;

// Lookup maps
const vendorMap = new Map(vendors.map(v => [v.vendorId, v]));
const familyMap = new Map(families.map(f => [f.familyId, f]));
const deviceMap = new Map(devices.map(d => [d.deviceId, d]));

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function formatNumber(n, decimals = 2) {
  if (n == null) return null;
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function getMetricValue(device, metricName) {
  const m = device.metrics;
  if (!m) return null;
  switch (metricName) {
    case 'tops': return m.effectiveInt8Tops;
    case 'topsPerDollar': return m.topsPerDollar;
    case 'topsPerWatt': return m.topsPerWatt;
    case 'perfPerDollar': return m.perfPerDollar;
    case 'perfPerWatt': return m.perfPerWatt;
    default: return null;
  }
}

function deviceToSummary(device) {
  return {
    deviceId: device.deviceId,
    modelName: device.modelName,
    sku: device.sku || null,
    vendor: device.vendorName,
    category: device.categoryName,
    family: device.familyName,
    architecture: device.architecture,
    launchDate: device.launchDate,
    tdpWatts: device.tdpWatts,
    memoryCapacityGB: device.memoryCapacityGB || null,
    memoryType: device.memoryType || null,
    memoryBandwidthGBps: device.memoryBandwidthGBps || null,
    latestPrice: device.metrics?.latestPrice || null,
    effectiveInt8Tops: device.metrics?.effectiveInt8Tops || 0,
    topsPerDollar: device.metrics?.topsPerDollar,
    topsPerWatt: device.metrics?.topsPerWatt,
    perfPerDollar: device.metrics?.perfPerDollar,
    perfPerWatt: device.metrics?.perfPerWatt,
    dataCompleteness: device.metrics?.dataCompleteness || 0,
  };
}

function deviceToDetail(device) {
  return {
    ...deviceToSummary(device),
    processNm: device.processNm || null,
    cores: device.cores || null,
    threads: device.threads || null,
    formFactor: device.formFactor || null,
    interface: device.interface || null,
    notes: device.notes || null,
    referenceUrl: device.referenceUrl || null,
    purchaseUrl: device.purchaseUrl || null,
    // GPU-specific
    tmus: device.tmus || null,
    rops: device.rops || null,
    tensorCores: device.tensorCores || null,
    rtCores: device.rtCores || null,
    baseClockMhz: device.baseClockMhz || null,
    boostClockMhz: device.boostClockMhz || null,
    memoryBusWidth: device.memoryBusWidth || null,
    // Compute metrics detail
    fp4Tflops: device.metrics?.fp4Tflops,
    fp8Tflops: device.metrics?.fp8Tflops,
    fp16Tflops: device.metrics?.fp16Tflops,
    fp32Tflops: device.metrics?.fp32Tflops,
    topBenchmarkScore: device.metrics?.topBenchmarkScore,
    topBenchmarkType: device.metrics?.topBenchmarkType,
    dataCompleteness: device.metrics?.dataCompleteness || 0,
    // Related data
    benchmarks: benchmarksByDevice[device.deviceId] || [],
    specs: specsByDevice[device.deviceId] || [],
    prices: pricesByDevice[device.deviceId] || [],
  };
}

// ---------------------------------------------------------------------------
// Tool Implementations
// ---------------------------------------------------------------------------

const tools = [
  {
    name: 'search_devices',
    description:
      'Search for devices by name, vendor, or category. Returns matching devices with key specs and computed metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (matches device name, SKU, vendor, or family)',
        },
        category: {
          type: 'string',
          description: 'Filter by device category (CPU, GPU, SBC, NPU, ASIC, SoC, System, Memory, Storage)',
          enum: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_device',
    description:
      'Get full details for a single device by its ID. Includes specs, benchmarks, prices, and all computed metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          description: 'The device ID (e.g. "nvidia-rtx-5090", "amd-ryzen-9-9950x")',
        },
      },
      required: ['deviceId'],
    },
  },
  {
    name: 'compare_devices',
    description:
      'Compare multiple devices side-by-side. Returns full details for each device for direct comparison.',
    inputSchema: {
      type: 'object',
      properties: {
        deviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of device IDs to compare (2-10 devices)',
        },
      },
      required: ['deviceIds'],
    },
  },
  {
    name: 'get_rankings',
    description:
      'Get top devices ranked by a specific metric. Useful for finding the best devices by performance, efficiency, or value.',
    inputSchema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          description: 'The metric to rank by',
          enum: ['tops', 'topsPerDollar', 'topsPerWatt', 'perfPerDollar', 'perfPerWatt'],
        },
        category: {
          type: 'string',
          description: 'Optional category filter',
          enum: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 20)',
          default: 20,
        },
      },
      required: ['metric'],
    },
  },
  {
    name: 'get_categories',
    description:
      'List all device categories with device counts and average metrics for each category.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_vendors',
    description:
      'List all vendors with device counts and category breakdown. Optionally filter by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter',
          enum: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
        },
      },
    },
  },
  {
    name: 'get_stats',
    description:
      'Get overall platform statistics including total devices, vendors, categories, benchmarks, and data completeness.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'find_best_value',
    description:
      'Find the best value devices for a given budget or use case. Ranks devices by TOPS per dollar with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        maxPrice: {
          type: 'number',
          description: 'Maximum price in USD',
        },
        category: {
          type: 'string',
          description: 'Optional category filter',
          enum: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
        },
        minTops: {
          type: 'number',
          description: 'Minimum effective INT8 TOPS',
        },
        maxTdp: {
          type: 'number',
          description: 'Maximum TDP in watts',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 10)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_category_stats',
    description:
      'Get detailed statistics for each device category: device count, vendor count, average TDP, price range, and TOPS metrics.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_power_efficiency',
    description:
      'Find the most power-efficient AI accelerators ranked by TOPS per watt. Filter by maximum TDP for edge/embedded use cases.',
    inputSchema: {
      type: 'object',
      properties: {
        maxTdp: {
          type: 'number',
          description: 'Maximum TDP in watts (e.g., 15 for edge devices, 75 for desktop)',
        },
        category: {
          type: 'string',
          description: 'Optional category filter',
          enum: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_compute_metrics',
    description:
      'Get detailed compute metrics (INT8 TOPS, FP4/FP8/FP16/FP32 TFLOPS) for one or more devices. Useful for comparing raw compute capability.',
    inputSchema: {
      type: 'object',
      properties: {
        deviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of device IDs to get compute metrics for',
        },
      },
      required: ['deviceIds'],
    },
  },
];

function handleSearchDevices(args) {
  const { query, category, limit = 20 } = args;
  const q = query.toLowerCase();

  let results = devices.filter(d => {
    const matchesQuery =
      d.modelName.toLowerCase().includes(q) ||
      (d.sku && d.sku.toLowerCase().includes(q)) ||
      d.vendorName.toLowerCase().includes(q) ||
      d.familyName.toLowerCase().includes(q) ||
      d.architecture.toLowerCase().includes(q);
    const matchesCategory = !category || d.categoryName === category;
    return matchesQuery && matchesCategory;
  });

  results = results.slice(0, limit);
  return {
    content: [{ type: 'text', text: JSON.stringify(results.map(deviceToSummary), null, 2) }],
  };
}

function handleGetDevice(args) {
  const { deviceId } = args;
  const device = deviceMap.get(deviceId);

  if (!device) {
    const available = devices.slice(0, 20).map(d => d.deviceId).join(', ');
    return {
      content: [{ type: 'text', text: `Device "${deviceId}" not found. Available devices include: ${available}...` }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(deviceToDetail(device), null, 2) }],
  };
}

function handleCompareDevices(args) {
  const { deviceIds } = args;

  if (!Array.isArray(deviceIds) || deviceIds.length < 2) {
    return {
      content: [{ type: 'text', text: 'Provide at least 2 device IDs to compare.' }],
      isError: true,
    };
  }

  if (deviceIds.length > 10) {
    return {
      content: [{ type: 'text', text: 'Maximum 10 devices can be compared at once.' }],
      isError: true,
    };
  }

  const found = [];
  const notFound = [];

  for (const id of deviceIds) {
    const device = deviceMap.get(id);
    if (device) {
      found.push(deviceToDetail(device));
    } else {
      notFound.push(id);
    }
  }

  if (found.length === 0) {
    return {
      content: [{ type: 'text', text: `None of the specified devices were found. Not found: ${notFound.join(', ')}` }],
      isError: true,
    };
  }

  let result = { devices: found };
  if (notFound.length > 0) {
    result.notFound = notFound;
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

function handleGetRankings(args) {
  const { metric, category, limit = 20 } = args;

  let filtered = devices;
  if (category) {
    filtered = filtered.filter(d => d.categoryName === category);
  }

  // Filter to devices that have the requested metric
  const ranked = filtered
    .filter(d => getMetricValue(d, metric) != null)
    .map(d => ({
      deviceId: d.deviceId,
      modelName: d.modelName,
      vendor: d.vendorName,
      category: d.categoryName,
      [metric]: formatNumber(getMetricValue(d, metric)),
      price: d.metrics?.latestPrice || null,
      tdpWatts: d.tdpWatts || null,
    }))
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, limit);

  return {
    content: [{ type: 'text', text: JSON.stringify({
      metric,
      category: category || 'all',
      count: ranked.length,
      rankings: ranked,
    }, null, 2) }],
  };
}

function handleGetCategories() {
  const categories = {};

  for (const device of devices) {
    const cat = device.categoryName;
    if (!categories[cat]) {
      categories[cat] = {
        category: cat,
        deviceCount: 0,
        vendors: new Set(),
        totalTops: 0,
        topsWithPrice: 0,
        topsWithTdp: 0,
        avgDataCompleteness: 0,
        dataCompletenessSum: 0,
      };
    }
    categories[cat].deviceCount++;
    categories[cat].vendors.add(device.vendorName);
    if (device.metrics) {
      categories[cat].totalTops += device.metrics.effectiveInt8Tops || 0;
      if (device.metrics.topsPerDollar != null) categories[cat].topsWithPrice++;
      if (device.metrics.topsPerWatt != null) categories[cat].topsWithTdp++;
      categories[cat].dataCompletenessSum += device.metrics.dataCompleteness || 0;
    }
  }

  const result = Object.values(categories).map(c => ({
    category: c.category,
    deviceCount: c.deviceCount,
    vendorCount: c.vendors.size,
    vendors: [...c.vendors].sort(),
    avgDataCompleteness: c.deviceCount > 0
      ? formatNumber(c.dataCompletenessSum / c.deviceCount, 3)
      : 0,
    devicesWithPriceEfficiency: c.topsWithPrice,
    devicesWithPowerEfficiency: c.topsWithTdp,
  }));

  result.sort((a, b) => b.deviceCount - a.deviceCount);

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

function handleGetVendors(args) {
  const { category } = args || {};

  const vendorStats = {};

  for (const device of devices) {
    if (category && device.categoryName !== category) continue;

    const vName = device.vendorName;
    const vId = device.vendorId;
    if (!vendorStats[vId]) {
      vendorStats[vId] = {
        vendorId: vId,
        vendorName: vName,
        country: vendorMap.get(vId)?.country || null,
        website: vendorMap.get(vId)?.website || null,
        deviceCount: 0,
        categories: new Set(),
      };
    }
    vendorStats[vId].deviceCount++;
    vendorStats[vId].categories.add(device.categoryName);
  }

  const result = Object.values(vendorStats)
    .map(v => ({
      ...v,
      categories: [...v.categories].sort(),
    }))
    .sort((a, b) => b.deviceCount - a.deviceCount);

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

function handleGetStats() {
  const categories = new Set(devices.map(d => d.categoryName));
  const devicesWithPrices = devices.filter(d => d.metrics?.latestPrice).length;
  const devicesWithBenchmarks = devices.filter(d => d.metrics?.topBenchmarkScore).length;
  const devicesWithSpecs = devices.filter(d => d.metrics?.dataCompleteness > 0).length;
  const avgCompleteness = devices.length > 0
    ? formatNumber(
        devices.reduce((sum, d) => sum + (d.metrics?.dataCompleteness || 0), 0) / devices.length,
        3
      )
    : 0;

  // Count by category
  const categoryCounts = {};
  for (const d of devices) {
    categoryCounts[d.categoryName] = (categoryCounts[d.categoryName] || 0) + 1;
  }

  // Price range
  const priced = devices.filter(d => d.metrics?.latestPrice).map(d => d.metrics.latestPrice);
  const priceRange = priced.length > 0
    ? { min: Math.min(...priced), max: Math.max(...priced) }
    : null;

  // TOPS range
  const topsValues = devices.map(d => d.metrics?.effectiveInt8Tops || 0).filter(t => t > 0);
  const topsRange = topsValues.length > 0
    ? { min: Math.min(...topsValues), max: Math.max(...topsValues) }
    : null;

  return {
    content: [{ type: 'text', text: JSON.stringify({
      totalDevices: devices.length,
      totalVendors: vendors.length,
      totalFamilies: families.length,
      totalCategories: categories.size,
      totalBenchmarks: benchmarks.length,
      totalSpecs: specs.length,
      totalPrices: prices.length,
      totalSources: sources.length,
      totalBenchmarkTypes: benchmarkTypes.length,
      dataCoverage: {
        devicesWithPrices,
        devicesWithBenchmarks,
        devicesWithSpecs,
        avgDataCompleteness: avgCompleteness,
      },
      categories: Object.fromEntries(
        Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
      ),
      priceRange,
      topsRange,
      generatedAt: data._meta.generatedAt,
    }, null, 2) }],
  };
}

function handleFindBestValue(args) {
  const { maxPrice, category, minTops, maxTdp, limit = 10 } = args || {};

  let filtered = devices.filter(d => {
    // Must have price and TOPS/$
    if (!d.metrics?.latestPrice) return false;
    if (d.metrics.topsPerDollar == null) return false;

    if (maxPrice && d.metrics.latestPrice > maxPrice) return false;
    if (category && d.categoryName !== category) return false;
    if (minTops && (d.metrics.effectiveInt8Tops || 0) < minTops) return false;
    if (maxTdp && (d.tdpWatts || Infinity) > maxTdp) return false;

    return true;
  });

  const ranked = filtered
    .map(d => ({
      deviceId: d.deviceId,
      modelName: d.modelName,
      vendor: d.vendorName,
      category: d.categoryName,
      price: d.metrics.latestPrice,
      effectiveInt8Tops: d.metrics.effectiveInt8Tops,
      topsPerDollar: d.metrics.topsPerDollar,
      topsPerWatt: d.metrics.topsPerWatt,
      tdpWatts: d.tdpWatts || null,
      memoryCapacityGB: d.memoryCapacityGB || null,
      dataCompleteness: d.metrics.dataCompleteness || 0,
    }))
    .sort((a, b) => b.topsPerDollar - a.topsPerDollar)
    .slice(0, limit);

  return {
    content: [{ type: 'text', text: JSON.stringify({
      filters: { maxPrice, category, minTops, maxTdp },
      resultCount: ranked.length,
      recommendations: ranked,
    }, null, 2) }],
  };
}

// ---------------------------------------------------------------------------
// Additional Tool Handlers
// ---------------------------------------------------------------------------

function handleGetCategoryStats(args) {
  const categories = {};
  for (const d of devices) {
    const cat = d.categoryName;
    if (!categories[cat]) {
      categories[cat] = {
        category: cat,
        deviceCount: 0,
        vendorSet: new Set(),
        tdps: [],
        prices: [],
        topsList: [],
      };
    }
    const c = categories[cat];
    c.deviceCount++;
    c.vendorSet.add(d.vendorName);
    if (d.tdpWatts) c.tdps.push(d.tdpWatts);
    if (d.metrics?.latestPrice) c.prices.push(d.metrics.latestPrice);
    if (d.metrics?.effectiveInt8Tops) c.topsList.push(d.metrics.effectiveInt8Tops);
  }

  const result = Object.values(categories).map(c => ({
    category: c.category,
    deviceCount: c.deviceCount,
    vendorCount: c.vendorSet.size,
    vendors: [...c.vendorSet].sort(),
    avgTdp: c.tdps.length ? Math.round(c.tdps.reduce((s, v) => s + v, 0) / c.tdps.length) : null,
    minPrice: c.prices.length ? Math.min(...c.prices) : null,
    maxPrice: c.prices.length ? Math.max(...c.prices) : null,
    avgPrice: c.prices.length ? Math.round(c.prices.reduce((s, v) => s + v, 0) / c.prices.length) : null,
    avgTops: c.topsList.length ? formatNumber(c.topsList.reduce((s, v) => s + v, 0) / c.topsList.length) : 0,
    maxTops: c.topsList.length ? Math.max(...c.topsList) : 0,
  }));

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

function handleGetPowerEfficiency(args) {
  const { maxTdp, category, limit = 20 } = args;

  let filtered = devices.filter(d => d.tdpWatts && d.tdpWatts > 0);
  if (maxTdp) filtered = filtered.filter(d => d.tdpWatts <= maxTdp);
  if (category) filtered = filtered.filter(d => d.categoryName === category);

  const ranked = filtered
    .filter(d => d.metrics?.topsPerWatt != null)
    .map(d => ({
      deviceId: d.deviceId,
      modelName: d.modelName,
      vendor: d.vendorName,
      category: d.categoryName,
      tdpWatts: d.tdpWatts,
      effectiveInt8Tops: d.metrics.effectiveInt8Tops,
      topsPerWatt: formatNumber(d.metrics.topsPerWatt),
      price: d.metrics.latestPrice || null,
      memoryCapacityGB: d.memoryCapacityGB || null,
    }))
    .sort((a, b) => b.topsPerWatt - a.topsPerWatt)
    .slice(0, limit);

  return {
    content: [{ type: 'text', text: JSON.stringify({
      filter: { maxTdp: maxTdp || 'unlimited', category: category || 'all' },
      count: ranked.length,
      rankings: ranked,
    }, null, 2) }],
  };
}

function handleGetComputeMetrics(args) {
  const { deviceIds } = args;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    return { content: [{ type: 'text', text: 'Provide at least 1 device ID.' }], isError: true };
  }

  const results = deviceIds.map(id => {
    const d = deviceMap.get(id);
    if (!d) return { deviceId: id, error: 'not found' };

    const devSpecs = specsByDevice[id] || [];
    const primarySpec = devSpecs[0] || {};

    return {
      deviceId: id,
      modelName: d.modelName,
      vendor: d.vendorName,
      category: d.categoryName,
      int8Tops: primarySpec.int8Tops || null,
      fp4Tflops: primarySpec.fp4Tflops || null,
      fp8Tflops: primarySpec.fp8Tflops || null,
      fp16Tflops: primarySpec.fp16Tflops || null,
      fp32Tflops: primarySpec.fp32Tflops || null,
      tdpWatts: d.tdpWatts || null,
      memoryCapacityGB: d.memoryCapacityGB || null,
      memoryBandwidthGBps: d.memoryBandwidthGBps || null,
      price: d.metrics?.latestPrice || null,
      topsPerDollar: d.metrics?.topsPerDollar || null,
      topsPerWatt: d.metrics?.topsPerWatt || null,
    };
  });

  return {
    content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
  };
}

// ---------------------------------------------------------------------------
// MCP Protocol Handler
// ---------------------------------------------------------------------------

const toolHandlers = {
  search_devices: handleSearchDevices,
  get_device: handleGetDevice,
  compare_devices: handleCompareDevices,
  get_rankings: handleGetRankings,
  get_categories: handleGetCategories,
  get_vendors: handleGetVendors,
  get_stats: handleGetStats,
  find_best_value: handleFindBestValue,
  get_category_stats: handleGetCategoryStats,
  get_power_efficiency: handleGetPowerEfficiency,
  get_compute_metrics: handleGetComputeMetrics,
};

function send(message) {
  const json = JSON.stringify(message);
  process.stdout.write(json + '\n');
}

function handleRequest(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'siliconrank',
          version: '1.0.0',
        },
      },
    });
    return;
  }

  if (method === 'notifications/initialized') {
    // Client acknowledged initialization, no response needed
    return;
  }

  if (method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id,
      result: { tools },
    });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params || {};
    const handler = toolHandlers[name];

    if (!handler) {
      send({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Unknown tool: ${name}. Available tools: ${Object.keys(toolHandlers).join(', ')}`,
        },
      });
      return;
    }

    try {
      const result = handler(toolArgs || {});
      send({
        jsonrpc: '2.0',
        id,
        result,
      });
    } catch (err) {
      send({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: `Tool error: ${err.message}`,
        },
      });
    }
    return;
  }

  // Unknown method
  send({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
}

// ---------------------------------------------------------------------------
// Main: Read stdin line by line
// ---------------------------------------------------------------------------

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const message = JSON.parse(line);
    handleRequest(message);
  } catch (err) {
    process.stderr.write(`MCP parse error: ${err.message}\n`);
  }
});

rl.on('close', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
