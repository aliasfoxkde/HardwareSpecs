#!/usr/bin/env python3
"""
TechPowerUp GPU Specs Scraper
Scrapes GPU specifications from techpowerup.com/gpu-specs/ using Crawl4AI + Playwright.

Usage:
  # Activate venv first: source .venv/bin/activate
  # Scrape a single GPU (test):
  python scripts/scrape_tpu.py --single "rtx-pro-6000-blackwell.c4272"
  # Scrape first 5 GPUs:
  python scripts/scrape_tpu.py --limit 5
  # Scrape all 175 GPUs:
  python scripts/scrape_tpu.py
  # Resume from checkpoint:
  python scripts/scrape_tpu.py --resume
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup

# Try Crawl4AI first, fall back to requests
try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
    HAS_CRAWL4AI = True
except ImportError:
    HAS_CRAWL4AI = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "tpu_specs_raw"
GPU_LIST_PATH = BASE_DIR.parent / "docs" / "GPU_LIST.md"
CHECKPOINT_PATH = OUTPUT_DIR / ".checkpoint.json"
OUTPUT_JSON = OUTPUT_DIR / "gpu_data.json"
RAW_HTML_DIR = OUTPUT_DIR / "html"

BASE_URL = "https://www.techpowerup.com/gpu-specs/"

# Rate limiting
MIN_DELAY = 3.0  # seconds between requests
MAX_RETRIES = 3
RETRY_BACKOFF = 2.0


# ─── GPU name → TPU URL slug mapping ───────────────────────────────────────────

GPU_URL_MAP = {
    "RTX PRO 6000 Blackwell": "rtx-pro-6000-blackwell.c4272",
    "GeForce RTX 5090": "geforce-rtx-5090.c4181",
    "GeForce RTX 4090": "geforce-rtx-4090.c3898",
    "GeForce RTX 5080": "geforce-rtx-5080.c4180",
    "GeForce RTX 4080 SUPER": "geforce-rtx-4080-super.c3952",
    "GeForce RTX 4080": "geforce-rtx-4080.c3896",
    "Radeon RX 7900 XTX": "radeon-rx-7900-xtx.c3924",
    "GeForce RTX 5070 Ti": "geforce-rtx-5070-ti.c4179",
    "Radeon RX 9070 XT": "radeon-rx-9070-xt.c4239",
    "Radeon RX 7900 XT": "radeon-rx-7900-xt.c3923",
    "GeForce RTX 3090 Ti": "geforce-rtx-3090-ti.c3772",
    "GeForce RTX 4070 Ti SUPER": "geforce-rtx-4070-ti-super.c3982",
    "Radeon RX 9070": "radeon-rx-9070.c4240",
    "GeForce RTX 4070 Ti": "geforce-rtx-4070-ti.c3894",
    "GeForce RTX 5070": "geforce-rtx-5070.c4178",
    "GeForce RTX 3090": "geforce-rtx-3090.c3697",
    "GeForce RTX 3080 Ti": "geforce-rtx-3080-ti.c3698",
    "GeForce RTX 4070 SUPER": "geforce-rtx-4070-super.c3951",
    "Radeon RX 7900 GRE": "radeon-rx-7900-gre.c4037",
    "Radeon RX 6950 XT": "radeon-rx-6950-xt.c3861",
    "GeForce RTX 4070": "geforce-rtx-4070.c3892",
    "Radeon RX 6900 XT": "radeon-rx-6900-xt.c3552",
    "GeForce RTX 3080": "geforce-rtx-3080.c3612",
    "Radeon RX 7800 XT": "radeon-rx-7800-xt.c3969",
    "Radeon RX 6800 XT": "radeon-rx-6800-xt.c3477",
    "GeForce RTX 5060 Ti 16 GB": "geforce-rtx-5060-ti-16-gb.c4223",
    "GeForce RTX 5060 Ti 8 GB": "geforce-rtx-5060-ti-8-gb.c4222",
    "Radeon RX 7700 XT": "radeon-rx-7700-xt.c3970",
    "Radeon RX 9060 XT 16 GB": "radeon-rx-9060-xt-16-gb.c4274",
    "GeForce RTX 3070 Ti": "geforce-rtx-3070-ti.c3604",
    "Radeon RX 6800": "radeon-rx-6800.c3476",
    "Radeon RX 9060 XT 8 GB": "radeon-rx-9060-xt-8-gb.c4273",
    "GeForce RTX 3070": "geforce-rtx-3070.c3549",
    "GeForce RTX 2080 Ti": "geforce-rtx-2080-ti.c3399",
    "GeForce RTX 4060 Ti 8 GB": "geforce-rtx-4060-ti-8-gb.c3955",
    "GeForce RTX 5060": "geforce-rtx-5060.c4221",
    "Radeon RX 6750 XT": "radeon-rx-6750-xt.c3860",
    "GeForce RTX 3060 Ti": "geforce-rtx-3060-ti.c3550",
    "Radeon RX 6700 XT": "radeon-rx-6700-xt.c3551",
    "GeForce RTX 2080 SUPER": "geforce-rtx-2080-super.c3480",
    "Radeon RX 7600 XT": "radeon-rx-7600-xt.c4039",
    "GeForce RTX 4060": "geforce-rtx-4060.c3954",
    "Arc B580": "arc-b580.c4233",
    "GeForce RTX 5050": "geforce-rtx-5050.c4220",
    "GeForce RTX 2080": "geforce-rtx-2080.c3398",
    "Radeon RX 6650 XT": "radeon-rx-6650-xt.c3774",
    "Radeon RX 7600": "radeon-rx-7600.c3862",
    "GeForce RTX 2070 SUPER": "geforce-rtx-2070-super.c3441",
    "GeForce GTX 1080 Ti": "geforce-gtx-1080-ti.c3228",
    "Arc A770": "arc-a770.c3808",
    "GeForce RTX 3060 12 GB": "geforce-rtx-3060-12-gb.c3723",
    "Radeon RX 6600 XT": "radeon-rx-6600-xt.c3553",
    "Radeon VII": "radeon-vii.c3281",
    "Arc A750": "arc-a750.c3807",
    "Radeon RX 5700 XT": "radeon-rx-5700-xt.c3372",
    "GeForce RTX 2070": "geforce-rtx-2070.c3397",
    "Radeon RX 6600": "radeon-rx-6600.c3601",
    "Arc A580": "arc-a580.c3809",
    "GeForce RTX 2060 SUPER": "geforce-rtx-2060-super.c3440",
    "Radeon RX Vega 64": "radeon-rx-vega-64.c3226",
    "GeForce RTX 2060": "geforce-rtx-2060.c3396",
    "Radeon RX 5700": "radeon-rx-5700.c3373",
    "GeForce GTX 1080": "geforce-gtx-1080.c3227",
    "GeForce GTX 1070 Ti": "geforce-gtx-1070-ti.c3267",
    "Radeon RX 5600 XT": "radeon-rx-5600-xt.c3554",
    "Radeon RX Vega 56": "radeon-rx-vega-56.c3225",
    "GeForce GTX 1070": "geforce-gtx-1070.c3229",
    "GeForce GTX 1660 SUPER": "geforce-gtx-1660-super.c3555",
    "GeForce GTX 1660 Ti": "geforce-gtx-1660-ti.c3483",
    "GeForce GTX 980 Ti": "geforce-gtx-980-ti.c2969",
    "GeForce RTX 3050 8 GB": "geforce-rtx-3050-8-gb.c3966",
    "Radeon R9 FURY X": "radeon-r9-fury-x.c2987",
    "GeForce GTX 1660": "geforce-gtx-1660.c3556",
    "Radeon RX 590": "radeon-rx-590.c3409",
    "Radeon R9 FURY": "radeon-r9-fury.c2988",
    "GeForce GTX 980": "geforce-gtx-980.c2725",
    "GeForce GTX 1650 SUPER": "geforce-gtx-1650-super.c3557",
    "Radeon RX 6500 XT": "radeon-rx-6500-xt.c3775",
    "Radeon RX 5500 XT": "radeon-rx-5500-xt.c3408",
    "Radeon RX 580": "radeon-rx-580.c3283",
    "GeForce GTX 1060 6 GB": "geforce-gtx-1060-6-gb.c3245",
    "Radeon R9 390X": "radeon-r9-390x.c2744",
    "GeForce GTX 690": "geforce-gtx-690.c2155",
    "Radeon RX 480": "radeon-rx-480.c3247",
    "Radeon HD 7990": "radeon-hd-7990.c2457",
    "GeForce GTX 780 Ti": "geforce-gtx-780-ti.c2447",
    "GeForce GTX 970": "geforce-gtx-970.c2726",
    "Radeon R9 290X": "radeon-r9-290x.c2539",
    "Radeon R9 390": "radeon-r9-390.c2745",
    "Radeon RX 570": "radeon-rx-570.c3248",
    "Radeon R9 290": "radeon-r9-290.c2540",
    "Radeon RX 470": "radeon-rx-470.c3249",
    "GeForce GTX 1650": "geforce-gtx-1650.c3558",
    "Radeon RX 6400": "radeon-rx-6400.c3724",
    "Arc A380": "arc-a380.c3810",
    "GeForce GTX 780": "geforce-gtx-780.c2446",
    "Radeon HD 7970 GHz Edition": "radeon-hd-7970-ghz-edition.c2508",
    "GeForce GTX 590": "geforce-gtx-590.c2154",
    "Radeon R9 280X": "radeon-r9-280x.c2557",
    "Radeon HD 6990": "radeon-hd-6990.c2157",
    "GeForce GTX 1050 Ti": "geforce-gtx-1050-ti.c3412",
    "GeForce GTX 680": "geforce-gtx-680.c2156",
    "Radeon R9 380": "radeon-r9-380.c2660",
    "Radeon HD 7970": "radeon-hd-7970.c2220",
    "GeForce GTX 770": "geforce-gtx-770.c2445",
    "Radeon R9 285": "radeon-r9-285.c2558",
    "GeForce GTX 960": "geforce-gtx-960.c2727",
    "GeForce GTX 670": "geforce-gtx-670.c2184",
    "Radeon HD 5970": "radeon-hd-5970.c1860",
    "GeForce GTX 1630": "geforce-gtx-1630.c3786",
    "Radeon HD 7950": "radeon-hd-7950.c2221",
    "GeForce GTX 1050": "geforce-gtx-1050.c3411",
    "GeForce GTX 760": "geforce-gtx-760.c2444",
    "GeForce GTX 580": "geforce-gtx-580.c2093",
    "GeForce GTX 660 Ti": "geforce-gtx-660-ti.c2147",
    "Radeon R9 270X": "radeon-r9-270x.c2583",
    "Radeon HD 7870 GHz Edition": "radeon-hd-7870-ghz-edition.c2278",
    "GeForce GTX 950": "geforce-gtx-950.c2728",
    "Radeon RX 560": "radeon-rx-560.c3250",
    "GeForce GTX 570": "geforce-gtx-570.c2094",
    "GeForce GTX 660": "geforce-gtx-660.c2148",
    "Radeon RX 460": "radeon-rx-460.c3251",
    "Radeon R7 370": "radeon-r7-370.c2661",
    "Radeon HD 6970": "radeon-hd-6970.c2041",
    "GeForce GTX 480": "geforce-gtx-480.c1910",
    "Radeon HD 7850": "radeon-hd-7850.c2279",
    "GeForce GTX 295": "geforce-gtx-295.c1731",
    "Radeon HD 6950": "radeon-hd-6950.c2042",
    "GeForce GTX 750 Ti": "geforce-gtx-750-ti.c2438",
    "Radeon HD 4870 X2": "radeon-hd-4870-x2.c1750",
    "GeForce GTX 560 Ti": "geforce-gtx-560-ti.c2146",
    "Radeon HD 5870": "radeon-hd-5870.c1862",
    "Radeon HD 6870": "radeon-hd-6870.c2043",
    "GeForce GTX 470": "geforce-gtx-470.c1911",
    "GeForce GTX 650 Ti": "geforce-gtx-650-ti.c2264",
    "Radeon HD 5850": "radeon-hd-5850.c1863",
    "GeForce GTX 285": "geforce-gtx-285.c1732",
    "Radeon HD 6850": "radeon-hd-6850.c2044",
    "GeForce GTX 280": "geforce-gtx-280.c1733",
    "Radeon HD 7770 GHz Edition": "radeon-hd-7770-ghz-edition.c2280",
    "GeForce GTX 275": "geforce-gtx-275.c1734",
    "GeForce GT 1030": "geforce-gt-1030.c3414",
    "GeForce GTX 460": "geforce-gtx-460.c1912",
    "Radeon HD 4890": "radeon-hd-4890.c1751",
    "Radeon HD 6790": "radeon-hd-6790.c2045",
    "Radeon HD 5830": "radeon-hd-5830.c1864",
    "GeForce GTX 650": "geforce-gtx-650.c2265",
    "GeForce GTX 550 Ti": "geforce-gtx-550-ti.c2149",
    "Radeon HD 4870": "radeon-hd-4870.c1752",
    "GeForce GTX 260": "geforce-gtx-260.c1735",
    "Radeon HD 5770": "radeon-hd-5770.c1865",
    "Radeon HD 7750": "radeon-hd-7750.c2281",
    "Radeon HD 5750": "radeon-hd-5750.c1866",
    "GeForce GTS 450": "geforce-gts-450.c1913",
    "GeForce GTS 250": "geforce-gts-250.c1736",
    "Radeon HD 4850": "radeon-hd-4850.c1753",
    "Radeon HD 4770": "radeon-hd-4770.c1954",
    "Radeon HD 4830": "radeon-hd-4830.c1754",
    "Radeon HD 6670": "radeon-hd-6670.c2185",
    "GeForce 9800 GT": "geforce-9800-gt.c1125",
    "GeForce GT 640": "geforce-gt-640.c2266",
    "Radeon HD 5670": "radeon-hd-5670.c1867",
    "GeForce 9600 GT": "geforce-9600-gt.c1126",
    "GeForce GT 240": "geforce-gt-240.c1737",
    "GeForce GT 440": "geforce-gt-440.c1914",
    "Radeon HD 4670": "radeon-hd-4670.c1755",
    "Radeon HD 5570": "radeon-hd-5570.c1868",
    "GeForce GT 430": "geforce-gt-430.c1915",
    "GeForce GT 220": "geforce-gt-220.c1738",
    "GeForce GT 520": "geforce-gt-520.c2267",
    "Radeon HD 6450": "radeon-hd-6450.c2186",
    "Radeon HD 5450": "radeon-hd-5450.c1869",
    "Radeon HD 4550": "radeon-hd-4550.c1756",
    "GeForce 9400 GT": "geforce-9400-gt.c1127",
    "GeForce 210": "geforce-210.c1739",
}


# ─── Parsing helpers ───────────────────────────────────────────────────────────

def parse_number(text: str) -> float | None:
    """Extract a number from text like '24064', '126.0 TFLOPS', '1.79 TB/s', '8,565 USD'."""
    if not text:
        return None
    text = text.strip()
    # Remove commas
    text = text.replace(",", "")
    # Remove common units
    for unit in [" TFLOPS", " TFLOP", " TBytes/s", " TB/s", " GB/s", " GB",
                 " MB/s", " MHz", " nm", " W", " USD", " mm", " mm²",
                 " M/mm²", " million", " GPixel/s", " GTexel/s"]:
        text = text.replace(unit, "")
    text = text.strip()
    try:
        val = float(text)
        return val
    except ValueError:
        return None


def parse_bandwidth(text: str) -> float | None:
    """Parse bandwidth like '1.79 TB/s' to GB/s."""
    if not text:
        return None
    text = text.strip()
    text = text.replace(",", "")
    if "TB/s" in text:
        val = parse_number(text)
        return val * 1000 if val else None
    if "GB/s" in text:
        return parse_number(text)
    return parse_number(text)


def parse_memory_size(text: str) -> float | None:
    """Parse memory size like '96 GB', '8192 MB' to GB."""
    if not text:
        return None
    text = text.strip()
    text = text.replace(",", "")
    if "GB" in text:
        return parse_number(text)
    if "MB" in text:
        val = parse_number(text)
        return val / 1024 if val else None
    return parse_number(text)


def parse_tdp(text: str) -> float | None:
    """Parse TDP like '600 W' to watts."""
    return parse_number(text)


def parse_launch_price(text: str) -> float | None:
    """Parse launch price like '8,565 USD' or '$8,565'."""
    if not text:
        return None
    text = text.strip().replace(",", "").replace("$", "")
    if "USD" in text:
        text = text.replace("USD", "")
    text = text.strip()
    try:
        return float(text)
    except ValueError:
        return None


def parse_date(text: str) -> str | None:
    """Parse date like 'Mar 18th, 2025' to ISO format '2025-03-18'."""
    if not text:
        return None
    text = text.strip()
    # Remove ordinal suffixes
    text = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", text)
    for fmt in ("%b %d, %Y", "%B %d, %Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def parse_process_size(text: str) -> float | None:
    """Parse process size like '5 nm', '4 nm'."""
    return parse_number(text)


def extract_dd_text(dd_element) -> str:
    """Get clean text from a <dd> element, stripping HTML."""
    if dd_element is None:
        return ""
    # Get text, ignoring nested <span> content (ratios etc)
    text = dd_element.get_text(separator=" ", strip=True)
    # Remove ratio annotations like "(1:1)", "(1:64)"
    text = re.sub(r"\s*\(1:\d+\)", "", text).strip()
    return text


def extract_dd_number(dd_element) -> int | None:
    """Extract an integer from a <dd> element."""
    text = extract_dd_text(dd_element).replace(",", "").strip()
    try:
        return int(text)
    except (ValueError, TypeError):
        return None


# ─── HTML Parsing ──────────────────────────────────────────────────────────────

def parse_gpu_html(html: str, gpu_name: str, url_slug: str) -> dict:
    """Parse TechPowerUp GPU specs HTML and extract structured data."""
    soup = BeautifulSoup(html, "lxml")

    result = {
        "name": gpu_name,
        "url_slug": url_slug,
        "url": f"{BASE_URL}{url_slug}",
        "scraped_at": datetime.utcnow().isoformat() + "Z",
    }

    # GPU name from h1
    h1 = soup.select_one("h1.gpudb-name")
    if h1:
        result["tpu_name"] = h1.get_text(strip=True)

    # Extract all dt/dd pairs
    spec_pairs = {}
    for dl in soup.select("dl.clearfix"):
        dt = dl.find("dt")
        dd = dl.find("dd")
        if dt and dd:
            key = dt.get_text(strip=True)
            spec_pairs[key] = dd

    # Basic info
    result["architecture"] = extract_dd_text(spec_pairs.get("Architecture"))
    result["foundry"] = extract_dd_text(spec_pairs.get("Foundry"))
    result["process_size"] = parse_process_size(extract_dd_text(spec_pairs.get("Process Size")))
    result["transistors_millions"] = parse_number(extract_dd_text(spec_pairs.get("Transistors")))
    result["die_size_mm2"] = parse_number(extract_dd_text(spec_pairs.get("Die Size")))

    # Release info
    result["release_date"] = parse_date(extract_dd_text(spec_pairs.get("Release Date")))
    result["launch_price_usd"] = parse_launch_price(extract_dd_text(spec_pairs.get("Launch Price")))
    result["bus_interface"] = extract_dd_text(spec_pairs.get("Bus Interface"))
    result["production"] = extract_dd_text(spec_pairs.get("Production"))

    # Clock speeds
    result["base_clock_mhz"] = parse_number(extract_dd_text(spec_pairs.get("Base Clock")))
    result["boost_clock_mhz"] = parse_number(extract_dd_text(spec_pairs.get("Boost Clock")))

    # Memory
    result["memory_size_gb"] = parse_memory_size(extract_dd_text(spec_pairs.get("Memory Size")))
    result["memory_type"] = extract_dd_text(spec_pairs.get("Memory Type"))
    result["memory_bus"] = extract_dd_text(spec_pairs.get("Memory Bus"))
    result["memory_bandwidth_gbps"] = parse_bandwidth(extract_dd_text(spec_pairs.get("Bandwidth")))

    # Render config
    result["shading_units"] = extract_dd_number(spec_pairs.get("Shading Units"))
    result["tmus"] = extract_dd_number(spec_pairs.get("TMUs"))
    result["rops"] = extract_dd_number(spec_pairs.get("ROPs"))
    result["sm_count"] = extract_dd_number(spec_pairs.get("SM Count"))
    result["tensor_cores"] = extract_dd_number(spec_pairs.get("Tensor Cores"))
    result["rt_cores"] = extract_dd_number(spec_pairs.get("RT Cores"))
    result["l1_cache"] = extract_dd_text(spec_pairs.get("L1 Cache"))
    result["l2_cache"] = extract_dd_text(spec_pairs.get("L2 Cache"))

    # Theoretical performance
    result["pixel_rate"] = parse_number(extract_dd_text(spec_pairs.get("Pixel Rate")))
    result["texture_rate"] = parse_number(extract_dd_text(spec_pairs.get("Texture Rate")))
    result["fp16_tflops"] = parse_number(extract_dd_text(spec_pairs.get("FP16 (half)")))
    result["fp32_tflops"] = parse_number(extract_dd_text(spec_pairs.get("FP32 (float)")))
    result["fp64_tflops"] = parse_number(extract_dd_text(spec_pairs.get("FP64 (double)")))

    # Board design
    result["tdp_watts"] = parse_tdp(extract_dd_text(spec_pairs.get("TDP")))
    result["slot_width"] = extract_dd_text(spec_pairs.get("Slot Width"))
    result["length_mm"] = parse_number(extract_dd_text(spec_pairs.get("Length")))
    result["height_mm"] = parse_number(extract_dd_text(spec_pairs.get("Height")))
    result["width_mm"] = parse_number(extract_dd_text(spec_pairs.get("Width")))

    # Relative performance (the GPU's own perf bar)
    perf_entry = soup.select_one("div.gpudb-relative-performance-entry--primary")
    if perf_entry:
        data_length = perf_entry.get("data-length")
        if data_length:
            try:
                result["relative_performance"] = float(data_length)
            except ValueError:
                pass

    # GPU name from page (the GPU chip name, not the card name)
    gpu_name_dd = spec_pairs.get("GPU Name")
    if gpu_name_dd:
        result["gpu_chip"] = extract_dd_text(gpu_name_dd)

    return result


# ─── Fetching ──────────────────────────────────────────────────────────────────

async def fetch_page_crawl4ai(url: str) -> str | None:
    """Fetch a page using Crawl4AI with Playwright browser."""
    browser_config = BrowserConfig(
        browser_type="chromium",
        headless=True,
    )
    run_config = CrawlerRunConfig(
        word_count_threshold=10,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url, config=run_config)
        if result.success:
            return result.html
        else:
            print(f"  Crawl4AI failed: {result.error_message}")
            return None


def fetch_page_requests(url: str) -> str | None:
    """Fallback: fetch with requests (may be blocked by Cloudflare)."""
    if not HAS_REQUESTS:
        return None
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
        else:
            print(f"  HTTP {resp.status_code}")
            return None
    except Exception as e:
        print(f"  Requests error: {e}")
        return None


def fetch_page_local(url_slug: str) -> str | None:
    """Try to load from saved HTML file."""
    safe_name = url_slug.replace("/", "_").replace(".", "_")
    html_path = RAW_HTML_DIR / f"{safe_name}.html"
    if html_path.exists():
        return html_path.read_text(encoding="utf-8")
    return None


async def fetch_with_retry(gpu_name: str, url_slug: str) -> str | None:
    """Try multiple methods to fetch a page."""
    url = f"{BASE_URL}{url_slug}"

    # 1. Try local cache
    html = fetch_page_local(url_slug)
    if html:
        print(f"  [cache] Loaded from local file")
        return html

    # 2. Try Crawl4AI (best for bot-protected sites)
    if HAS_CRAWL4AI:
        for attempt in range(MAX_RETRIES):
            print(f"  [crawl4ai] Attempt {attempt + 1}/{MAX_RETRIES}...")
            html = await fetch_page_crawl4ai(url)
            if html:
                return html
            if attempt < MAX_RETRIES - 1:
                wait = RETRY_BACKOFF * (2 ** attempt)
                print(f"  Retrying in {wait:.0f}s...")
                await asyncio_sleep(wait)

    # 3. Try requests (fallback)
    if HAS_REQUESTS:
        print(f"  [requests] Trying requests fallback...")
        html = fetch_page_requests(url)
        if html:
            return html

    print(f"  FAILED: All methods exhausted")
    return None


def asyncio_sleep(seconds: float):
    """Helper to sleep in async context."""
    import asyncio
    return asyncio.sleep(seconds)


# ─── Checkpoint management ─────────────────────────────────────────────────────

def load_checkpoint() -> set:
    """Load set of already-scraped GPU slugs from checkpoint."""
    if CHECKPOINT_PATH.exists():
        data = json.loads(CHECKPOINT_PATH.read_text())
        return set(data.get("completed", []))
    return set()


def save_checkpoint(completed: set):
    """Save checkpoint with completed GPU slugs."""
    CHECKPOINT_PATH.write_text(json.dumps({"completed": sorted(completed)}, indent=2))


# ─── Main ─────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="Scrape TechPowerUp GPU specs")
    parser.add_argument("--single", help="Scrape a single GPU by slug (e.g. 'geforce-rtx-5090.c4181')")
    parser.add_argument("--limit", type=int, default=0, help="Only scrape first N GPUs")
    parser.add_argument("--resume", action="store_true", help="Resume from checkpoint")
    parser.add_argument("--skip-crawl4ai", action="store_true", help="Skip Crawl4AI, use requests only")
    parser.add_argument("--test", action="store_true", help="Test parse on saved HTML file")
    args = parser.parse_args()

    global HAS_CRAWL4AI
    if args.skip_crawl4ai:
        HAS_CRAWL4AI = False

    # Ensure output dirs exist
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    RAW_HTML_DIR.mkdir(parents=True, exist_ok=True)

    # Test mode: parse the saved HTML file
    if args.test:
        test_html_path = BASE_DIR.parent / "docs" / "NVIDIA_RTX_PRO_6000_Blackwell_GPU_SPECS.html"
        if test_html_path.exists():
            html = test_html_path.read_text(encoding="utf-8")
            data = parse_gpu_html(html, "RTX PRO 6000 Blackwell", "rtx-pro-6000-blackwell.c4272")
            print(json.dumps(data, indent=2))
        else:
            print(f"Test file not found: {test_html_path}")
        return

    # Build GPU list
    if args.single:
        gpu_list = [(args.single, "unknown")]
        # Find the name for this slug
        for name, slug in GPU_URL_MAP.items():
            if slug == args.single:
                gpu_list = [(name, slug)]
                break
    else:
        gpu_list = list(GPU_URL_MAP.items())
        if args.limit > 0:
            gpu_list = gpu_list[:args.limit]

    # Load checkpoint
    completed = load_checkpoint() if args.resume else set()

    # Load existing results
    existing_results = []
    if OUTPUT_JSON.exists():
        existing_results = json.loads(OUTPUT_JSON.read_text())

    results = {r["url_slug"]: r for r in existing_results}

    print(f"TechPowerUp GPU Scraper")
    print(f"  Total GPUs: {len(gpu_list)}")
    print(f"  Already completed: {len(completed)}")
    print(f"  Remaining: {len(gpu_list) - len(completed)}")
    print(f"  Crawl4AI: {'available' if HAS_CRAWL4AI else 'not available'}")
    print()

    import asyncio

    success_count = 0
    fail_count = 0

    for gpu_name, url_slug in gpu_list:
        if url_slug in completed:
            continue

        print(f"[{success_count + fail_count + 1}/{len(gpu_list)}] {gpu_name}")
        print(f"  URL: {BASE_URL}{url_slug}")

        html = await fetch_with_retry(gpu_name, url_slug)

        if html:
            # Save raw HTML
            safe_name = url_slug.replace("/", "_").replace(".", "_")
            html_path = RAW_HTML_DIR / f"{safe_name}.html"
            html_path.write_text(html, encoding="utf-8")

            # Parse and save
            data = parse_gpu_html(html, gpu_name, url_slug)
            results[url_slug] = data
            success_count += 1

            # Print key fields
            print(f"  -> Architecture: {data.get('architecture')}")
            print(f"  -> Process: {data.get('process_size')} nm")
            print(f"  -> Cores: {data.get('shading_units')}")
            print(f"  -> Memory: {data.get('memory_size_gb')} GB {data.get('memory_type')}")
            print(f"  -> TDP: {data.get('tdp_watts')} W")
            print(f"  -> FP32: {data.get('fp32_tflops')} TFLOPS")
            print(f"  -> Price: ${data.get('launch_price_usd')}")
            print(f"  -> Perf: {data.get('relative_performance')}%")
        else:
            fail_count += 1
            # Save a failed entry so we know what's missing
            results[url_slug] = {
                "name": gpu_name,
                "url_slug": url_slug,
                "url": f"{BASE_URL}{url_slug}",
                "scraped_at": datetime.utcnow().isoformat() + "Z",
                "error": "Failed to fetch",
            }

        # Update checkpoint
        completed.add(url_slug)
        save_checkpoint(completed)

        # Save intermediate results
        all_results = list(results.values())
        OUTPUT_JSON.write_text(json.dumps(all_results, indent=2))

        # Rate limiting
        if url_slug != gpu_list[-1][1]:
            print(f"  Waiting {MIN_DELAY:.0f}s...")
            await asyncio_sleep(MIN_DELAY)

    print()
    print(f"Done! Success: {success_count}, Failed: {fail_count}")
    print(f"Results saved to: {OUTPUT_JSON}")
    print(f"Raw HTML saved to: {RAW_HTML_DIR}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
