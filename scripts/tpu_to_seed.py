#!/usr/bin/env python3
"""
TechPowerUp scraped data → SiliconRank seed data converter.

Reads gpu_data.json from the scraper output and produces:
1. A diff showing which seed.ts devices would be enriched with TPU data
2. A TypeScript patch with new fields added to existing device entries

Usage:
  python scripts/tpu_to_seed.py [--apply]
  python scripts/tpu_to_seed.py --gpu gpu_data.json

The --apply flag will actually modify seed.ts with enriched data.
Without --apply, it prints a report of what would change.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

SEED_PATH = Path(__file__).parent.parent / "src" / "lib" / "data" / "seed.ts"
DEFAULT_GPU_DATA = Path(__file__).parent / "tpu_specs_raw" / "gpu_data.json"

# GPU name → deviceId mapping (best-effort heuristic)
def gpu_name_to_device_id(name: str) -> str | None:
    """Convert a TechPowerUp GPU name to a seed.ts deviceId."""
    name_lower = name.lower().strip()

    # NVIDIA patterns
    nvidia_map = {
        'rtx pro 6000 blackwell': 'nvidia-rtx-pro-6000-blackwell',
        'geforce rtx 5090': 'nvidia-rtx-5090',
        'geforce rtx 5080': 'nvidia-rtx-5080',
        'geforce rtx 5070 ti': 'nvidia-rtx-5070-ti',
        'geforce rtx 5070': 'nvidia-rtx-5070',
        'geforce rtx 5060 ti 16 gb': 'nvidia-rtx-5060-ti-16gb',
        'geforce rtx 5060 ti 8 gb': 'nvidia-rtx-5060-ti-8gb',
        'geforce rtx 5060': 'nvidia-rtx-5060',
        'geforce rtx 5050': 'nvidia-rtx-5050',
        'geforce rtx 4090': 'nvidia-rtx-4090',
        'geforce rtx 4080 super': 'nvidia-rtx-4080-super',
        'geforce rtx 4080': 'nvidia-rtx-4080',
        'geforce rtx 4070 ti super': 'nvidia-rtx-4070-ti-super',
        'geforce rtx 4070 ti': 'nvidia-rtx-4070-ti',
        'geforce rtx 4070 super': 'nvidia-rtx-4070-super',
        'geforce rtx 4070': 'nvidia-rtx-4070',
        'geforce rtx 4060 ti 16 gb': 'nvidia-rtx-4060-ti-16gb',
        'geforce rtx 4060 ti 8 gb': 'nvidia-rtx-4060-ti-8gb',
        'geforce rtx 4060': 'nvidia-rtx-4060',
        'geforce rtx 3050 8 gb': 'nvidia-rtx-3050-8gb',
        'geforce rtx 3090 ti': 'nvidia-rtx-3090-ti',
        'geforce rtx 3090': 'nvidia-rtx-3090',
        'geforce rtx 3080 ti': 'nvidia-rtx-3080-ti',
        'geforce rtx 3080': 'nvidia-rtx-3080',
        'geforce rtx 3070 ti': 'nvidia-rtx-3070-ti',
        'geforce rtx 3070': 'nvidia-rtx-3070',
        'geforce rtx 3060 12 gb': 'nvidia-rtx-3060-12gb',
        'geforce rtx 3060 ti': 'nvidia-rtx-3060-ti',
        'geforce rtx 2080 ti': 'nvidia-rtx-2080-ti',
        'geforce rtx 2080 super': 'nvidia-rtx-2080-super',
        'geforce rtx 2080': 'nvidia-rtx-2080',
        'geforce rtx 2070 super': 'nvidia-rtx-2070-super',
        'geforce rtx 2070': 'nvidia-rtx-2070',
        'geforce rtx 2060 super': 'nvidia-rtx-2060-super',
        'geforce rtx 2060': 'nvidia-rtx-2060',
        'geforce gtx 1080 ti': 'nvidia-gtx-1080-ti',
        'geforce gtx 1080': 'nvidia-gtx-1080',
        'geforce gtx 1070 ti': 'nvidia-gtx-1070-ti',
        'geforce gtx 1070': 'nvidia-gtx-1070',
        'geforce gtx 1660 super': 'nvidia-gtx-1660-super',
        'geforce gtx 1660 ti': 'nvidia-gtx-1660-ti',
        'geforce gtx 1660': 'nvidia-gtx-1660',
        'geforce gtx 1650 super': 'nvidia-gtx-1650-super',
        'geforce gtx 1650': 'nvidia-gtx-1650',
        'geforce gtx 1630': 'nvidia-gtx-1630',
        'geforce gtx 1060 6 gb': 'nvidia-gtx-1060-6gb',
        'geforce gtx 1050 ti': 'nvidia-gtx-1050-ti',
        'geforce gtx 1050': 'nvidia-gtx-1050',
        'geforce gtx 980 ti': 'nvidia-gtx-980-ti',
        'geforce gtx 980': 'nvidia-gtx-980',
        'geforce gtx 970': 'nvidia-gtx-970',
        'geforce gtx 960': 'nvidia-gtx-960',
        'geforce gtx 950': 'nvidia-gtx-950',
        'geforce gtx 780 ti': 'nvidia-gtx-780-ti',
        'geforce gtx 780': 'nvidia-gtx-780',
        'geforce gtx 770': 'nvidia-gtx-770',
        'geforce gtx 760': 'nvidia-gtx-760',
        'geforce gtx 690': 'nvidia-gtx-690',
        'geforce gtx 680': 'nvidia-gtx-680',
        'geforce gtx 670': 'nvidia-gtx-670',
        'geforce gtx 660 ti': 'nvidia-gtx-660-ti',
        'geforce gtx 660': 'nvidia-gtx-660',
        'geforce gtx 650 ti': 'nvidia-gtx-650-ti',
        'geforce gtx 650': 'nvidia-gtx-650',
        'geforce gtx 590': 'nvidia-gtx-590',
        'geforce gtx 580': 'nvidia-gtx-580',
        'geforce gtx 570': 'nvidia-gtx-570',
        'geforce gtx 550 ti': 'nvidia-gtx-550-ti',
        'geforce gtx 480': 'nvidia-gtx-480',
        'geforce gtx 470': 'nvidia-gtx-470',
        'geforce gtx 460': 'nvidia-gtx-460',
        'geforce gtx 295': 'nvidia-gtx-295',
        'geforce gtx 285': 'nvidia-gtx-285',
        'geforce gtx 280': 'nvidia-gtx-280',
        'geforce gtx 275': 'nvidia-gtx-275',
        'geforce gtx 260': 'nvidia-gtx-260',
        'geforce gt 1030': 'nvidia-gt-1030',
        'geforce gts 450': 'nvidia-gts-450',
        'geforce gts 250': 'nvidia-gts-250',
        'geforce gt 640': 'nvidia-gt-640',
        'geforce gt 520': 'nvidia-gt-520',
        'geforce gt 440': 'nvidia-gt-440',
        'geforce gt 430': 'nvidia-gt-430',
        'geforce gt 240': 'nvidia-gt-240',
        'geforce gt 220': 'nvidia-gt-220',
        'geforce 9800 gt': 'nvidia-9800-gt',
        'geforce 9600 gt': 'nvidia-9600-gt',
        'geforce 9400 gt': 'nvidia-9400-gt',
        'geforce 210': 'nvidia-geforce-210',
    }

    # AMD patterns
    amd_map = {
        'radeon rx 9070 xt': 'amd-rx-9070-xt',
        'radeon rx 9070': 'amd-rx-9070',
        'radeon rx 9060 xt 16 gb': 'amd-rx-9060-xt-16gb',
        'radeon rx 9060 xt 8 gb': 'amd-rx-9060-xt-8gb',
        'radeon rx 7900 xtx': 'amd-rx-7900-xtx',
        'radeon rx 7900 xt': 'amd-rx-7900-xt',
        'radeon rx 7900 gre': 'amd-rx-7900-gre',
        'radeon rx 7800 xt': 'amd-rx-7800-xt',
        'radeon rx 7700 xt': 'amd-rx-7700-xt',
        'radeon rx 7600 xt': 'amd-rx-7600-xt',
        'radeon rx 7600': 'amd-rx-7600',
        'radeon rx 6950 xt': 'amd-rx-6950-xt',
        'radeon rx 6800 xt': 'amd-rx-6800-xt',
        'radeon rx 6800': 'amd-rx-6800',
        'radeon rx 6750 xt': 'amd-rx-6750-xt',
        'radeon rx 6700 xt': 'amd-rx-6700-xt',
        'radeon rx 6650 xt': 'amd-rx-6650-xt',
        'radeon rx 6600 xt': 'amd-rx-6600-xt',
        'radeon rx 6600': 'amd-rx-6600',
        'radeon rx 6500 xt': 'amd-rx-6500-xt',
        'radeon rx 6400': 'amd-rx-6400',
        'radeon rx 590': 'amd-rx-590',
        'radeon rx 580': 'amd-rx-580',
        'radeon rx 5700 xt': 'amd-rx-5700-xt',
        'radeon rx 5700': 'amd-rx-5700',
        'radeon rx 5600 xt': 'amd-rx-5600-xt',
        'radeon rx 560': 'amd-rx-560',
        'radeon rx 5500 xt': 'amd-rx-5500-xt',
        'radeon rx 480': 'amd-rx-480',
        'radeon rx 470': 'amd-rx-470',
        'radeon rx 460': 'amd-rx-460',
        'radeon vii': 'amd-radeon-vii',
        'radeon rx vega 64': 'amd-rx-vega-64',
        'radeon rx vega 56': 'amd-rx-vega-56',
        'radeon r9 fury x': 'amd-r9-fury-x',
        'radeon r9 fury': 'amd-r9-fury',
        'radeon r9 390x': 'amd-r9-390x',
        'radeon r9 390': 'amd-r9-390',
        'radeon r9 290x': 'amd-r9-290x',
        'radeon r9 290': 'amd-r9-290',
        'radeon r9 380': 'amd-r9-380',
        'radeon r9 285': 'amd-r9-285',
        'r9 fury x': 'amd-r9-fury-x',
        'r9 fury': 'amd-r9-fury',
        'radeon hd 7990': 'amd-hd-7990',
        'radeon hd 7970 ghz edition': 'amd-hd-7970-ghz-edition',
        'radeon hd 7970': 'amd-hd-7970',
        'radeon hd 7950': 'amd-hd-7950',
        'radeon hd 7870 ghz edition': 'amd-hd-7870-ghz-edition',
        'radeon hd 7850': 'amd-hd-7850',
        'radeon hd 6970': 'amd-hd-6970',
        'radeon hd 6990': 'amd-hd-6990',
        'radeon hd 6870': 'amd-hd-6870',
        'radeon hd 6850': 'amd-hd-6850',
        'radeon hd 6790': 'amd-hd-6790',
        'radeon hd 6670': 'amd-hd-6670',
        'radeon hd 6450': 'amd-hd-6450',
        'radeon hd 5970': 'amd-hd-5970',
        'radeon hd 5870': 'amd-hd-5870',
        'radeon hd 5850': 'amd-hd-5850',
        'radeon hd 5830': 'amd-hd-5830',
        'radeon hd 5770': 'amd-hd-5770',
        'radeon hd 5750': 'amd-hd-5750',
        'radeon hd 5670': 'amd-hd-5670',
        'radeon hd 5570': 'amd-hd-5570',
        'radeon hd 4890': 'amd-hd-4890',
        'radeon hd 4870 x2': 'amd-hd-4870-x2',
        'radeon hd 4870': 'amd-hd-4870',
        'radeon hd 4850': 'amd-hd-4850',
        'radeon hd 4830': 'amd-hd-4830',
        'radeon hd 4770': 'amd-hd-4770',
        'radeon hd 4670': 'amd-hd-4670',
        'radeon hd 4550': 'amd-hd-4550',
    }

    # Intel Arc
    intel_map = {
        'arc b580': 'intel-arc-b580',
        'arc a770': 'intel-arc-a770',
        'arc a750': 'intel-arc-a750',
        'arc a580': 'intel-arc-a580',
        'arc a380': 'intel-arc-a380',
    }

    return nvidia_map.get(name_lower) or amd_map.get(name_lower) or intel_map.get(name_lower)


def load_gpu_data(path: Path) -> list[dict]:
    """Load scraped GPU data from JSON file."""
    if not path.exists():
        print(f"Error: GPU data file not found: {path}")
        print("Run the scraper first: python scripts/scrape_tpu.py --limit 5")
        sys.exit(1)
    return json.loads(path.read_text())


def extract_device_ids_from_seed(path: Path) -> set[str]:
    """Extract all deviceId values from seed.ts."""
    content = path.read_text()
    return set(re.findall(r"deviceId:\s*'([^']+)'", content))


def compute_enrichments(gpu_data: list[dict], existing_ids: set[str]) -> dict[str, dict]:
    """Compute enrichment data for each GPU that matches an existing device."""
    enrichments = {}
    for gpu in gpu_data:
        device_id = gpu_name_to_device_id(gpu.get('name', ''))
        if not device_id:
            continue

        # Check if this device exists in seed
        if device_id not in existing_ids:
            continue

        enrichment = {}

        # GPU-specific fields from TPU data
        if gpu.get('shading_units'):
            enrichment['cores'] = gpu['shading_units']
        if gpu.get('tmus'):
            enrichment['tmus'] = gpu['tmus']
        if gpu.get('rops'):
            enrichment['rops'] = gpu['rops']
        if gpu.get('tensor_cores'):
            enrichment['tensorCores'] = gpu['tensor_cores']
        if gpu.get('rt_cores'):
            enrichment['rtCores'] = gpu['rt_cores']
        if gpu.get('base_clock_mhz'):
            enrichment['baseClockMhz'] = gpu['base_clock_mhz']
        if gpu.get('boost_clock_mhz'):
            enrichment['boostClockMhz'] = gpu['boost_clock_mhz']
        if gpu.get('memory_bus'):
            enrichment['memoryBusWidth'] = gpu['memory_bus']
        if gpu.get('sm_count'):
            enrichment['smCount'] = gpu['sm_count']
        if gpu.get('process_size'):
            enrichment['processNm'] = gpu['process_size']
        if gpu.get('transistors_millions'):
            enrichment['transistors'] = gpu['transistors_millions']
        if gpu.get('die_size_mm2'):
            enrichment['dieSize'] = gpu['die_size_mm2']

        # Specs that go into spec snapshots
        specs = {}
        if gpu.get('fp16_tflops'):
            specs['fp16Tflops'] = gpu['fp16_tflops']
        if gpu.get('fp32_tflops'):
            specs['fp32Tflops'] = gpu['fp32_tflops']
        if gpu.get('tdp_watts'):
            specs['tdpWatts'] = gpu['tdp_watts']
        if gpu.get('memory_bandwidth_gbps'):
            specs['memoryBwGBps'] = gpu['memory_bandwidth_gbps']
        if gpu.get('pixel_rate'):
            specs['pixelRate'] = gpu['pixel_rate']
        if gpu.get('texture_rate'):
            specs['textureRate'] = gpu['texture_rate']
        if enrichment:
            enrichment['specs'] = specs

        # Price
        if gpu.get('launch_price_usd'):
            enrichment['price'] = gpu['launch_price_usd']

        if enrichment:
            enrichments[device_id] = enrichment

    return enrichments


def generate_report(enrichments: dict[str, dict]) -> str:
    """Generate a human-readable report of what would be enriched."""
    lines = []
    lines.append(f"TechPowerUp Enrichment Report")
    lines.append(f"{'='*50}")
    lines.append(f"  Devices matched: {len(enrichments)}")
    lines.append(f"  Fields available: TPU shading_units, tmus, rops, tensor_cores, rt_cores, clocks, memory_bus, process_size, FP16/FP32 TFLOPS, bandwidth")
    lines.append("")

    for device_id, enrich in sorted(enrichments.items()):
        fields = list(enrich.keys())
        if 'specs' in fields:
            fields.remove('specs')
            fields.append(f"specs({len(enrich['specs'])} fields)")
        lines.append(f"  {device_id}: {', '.join(fields)}")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description="Convert TPU scraped data to seed enrichment")
    parser.add_argument('--gpu-data', type=str, default=str(DEFAULT_GPU_DATA))
    parser.add_argument('--apply', action='store_true', help='Apply enrichments to seed.ts')
    args = parser.parse_args()

    gpu_data = load_gpu_data(Path(args.gpu_data))
    existing_ids = extract_device_ids_from_seed(SEED_PATH)

    print(f"Loaded {len(gpu_data)} scraped GPU records")
    print(f"Found {len(existing_ids)} existing devices in seed.ts")

    enrichments = compute_enrichments(gpu_data, existing_ids)
    print(generate_report(enrichments))

    if args.apply:
        print("\nApplying enrichments to seed.ts...")
        print("WARNING: This is a manual step — review the enrichment data above first.")
        print("The seed.ts file needs to be updated with the new fields.")
        print("\nTo apply manually, for each device in the enrichment:")
        print("  1. Find the device entry in seed.ts")
        print("  2. Add the TPU-specific fields (cores, tmus, rops, etc.)")
        print("  3. Update or add spec snapshots with FP16/FP32 data")
        print("  print(")

        # Save enrichment data as JSON for manual review
        output_path = Path(args.gpu_data).parent / "enrichments.json"
        output_path.write_text(json.dumps(enrichments, indent=2))
        print(f"\nEnrichment data saved to: {output_path}")
        print("Use this as reference when manually updating seed.ts")


if __name__ == '__main__':
    main()
