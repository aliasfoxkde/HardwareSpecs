# SiliconRank - AI Agent Guide

## Overview
SiliconRank is a comprehensive hardware comparison platform for AI accelerators, GPUs, NPUs, SBCs, CPUs, and embedded processors. Compare INT8 TOPS, FP4/FP8/FP16/FP32 compute, power efficiency, pricing, and benchmarks across 270+ devices.

## Purpose
Help engineers, researchers, and enthusiasts find and compare AI hardware by compute performance, power efficiency, and value.

## Key Pages
- / - Landing page with platform overview
- /browse - Browse and filter all devices
- /device/:id - Detailed device specifications, benchmarks, pricing
- /compare - Side-by-side device comparison
- /charts - Interactive performance charts
- /studio - Advanced data analysis workspace
- /tools - Hardware calculators and utilities
- /reports - Data quality reports and analytics
- /docs - API documentation and guides

## Data Coverage
- 304 devices across GPU, NPU, SBC, CPU, ASIC, SoC categories
- 35 vendors: NVIDIA, AMD, Intel, Apple, Qualcomm, Google, Groq, Cerebras, Hailo, Huawei, Rockchip, Broadcom, and more
- 191 device families, 398 benchmarks, 270 spec snapshots, 223 price points
- Metrics: INT8 TOPS (effective, vendor-reported), FP4/FP8/FP16/FP32 compute, TDP, price, memory, benchmarks
- Enterprise/data-center GPUs: NVIDIA H100/H200/B200/A100, AMD MI300X/MI250X, Intel Arc B580/A770
- Computed metrics: TOPS/$, TOPS/W, perf/$, perf/W, data completeness score

## MCP Server
An MCP (Model Context Protocol) server is available for programmatic access to device data.

### Setup
Add to your MCP client configuration (e.g., Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "siliconrank": {
      "command": "node",
      "args": ["/absolute/path/to/HardwareSpecs/mcp-server/index.mjs"]
    }
  }
}
```

### Building the Data File
The MCP server requires a pre-built data file. Generate it with:

```bash
cd /path/to/HardwareSpecs
npm run build:api
# or
npm run build:mcp
```

This runs `scripts/build-api-data.cjs` which bundles the TypeScript seed data, computes all metrics, and writes `mcp-server/data.json`.

### Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `search_devices` | Search by name, vendor, category | `query`, `category?`, `limit?` |
| `get_device` | Full device details by ID | `deviceId` |
| `compare_devices` | Side-by-side comparison (2-10 devices) | `deviceIds[]` |
| `get_rankings` | Top devices by metric | `metric` (tops/topsPerDollar/topsPerWatt/perfPerDollar/perfPerWatt), `category?`, `limit?` |
| `get_categories` | Category stats with device counts | `{}` |
| `get_vendors` | Vendor stats with category breakdown | `category?` |
| `get_stats` | Platform overview and data coverage | `{}` |
| `find_best_value` | Budget-optimized recommendations | `maxPrice?`, `category?`, `minTops?`, `maxTdp?`, `limit?` |

### Example: Finding best value GPUs under $500
```
find_best_value({ maxPrice: 500, category: "GPU", limit: 5 })
```

### Example: Compare specific devices
```
compare_devices({ deviceIds: ["nvidia-rtx-4090", "amd-rx-7900-xtx"] })
```

### Example: Get TOPS/$ rankings
```
get_rankings({ metric: "topsPerDollar", limit: 10 })
```

## Device ID Format
Device IDs follow the pattern: `{vendor}-{model-name}` with lowercase and hyphens.
Examples: `nvidia-rtx-5090`, `amd-ryzen-9-9950x`, `apple-m4-pro`, `qualcomm-snapdragon-x-elite`.

Use `search_devices` with a partial name to find the correct device ID if unsure.

## Contact
Site: https://siliconrank.cyopsys.com
