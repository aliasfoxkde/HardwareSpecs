# SiliconRank

**Open Hardware Intelligence Platform**

Compare CPUs, GPUs, NPUs, SBCs, AI accelerators, and more — all in one place, with normalized benchmarks, efficiency metrics, and interactive charts.

## Features

- **Multi-vendor database** — NVIDIA, AMD, Intel, Apple, Qualcomm, Hailo, Coral, Radxa, and more
- **Normalized benchmarks** — Geekbench, PassMark, TechPowerUp scores normalized to comparable scales
- **Efficiency metrics** — Performance per dollar, performance per watt, effective INT8 TOPS
- **Interactive charts** — Scatter plots, bar charts, and more with Recharts
- **Side-by-side comparison** — Compare up to 6 devices across all specs and benchmarks
- **Device profiles** — Detailed specs, benchmark history, price tracking, and data provenance
- **Global search** — Find any device by name, vendor, or family
- **Faceted filtering** — Filter by category, vendor, TDP, price, and more
- **PWA** — Install as a native app on any device with fullscreen support
- **Mobile-first** — Fully responsive design that works on any screen size
- **Open source** — MIT licensed, deploy to Cloudflare Pages for $0

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Tables**: TanStack React Table
- **Routing**: React Router v7
- **Testing**: Vitest + Testing Library
- **Deployment**: Cloudflare Pages
- **PWA**: Fullscreen manifest with offline support

## Categories

| Category | Description | Examples |
|----------|-------------|---------|
| CPU | Desktop, server, and mobile processors | Ryzen 9 9950X, Core i9-14900K, Apple M4 Max |
| GPU | Discrete and integrated graphics | RTX 5090, RX 9070 XT, Arc B580 |
| NPU | Neural processing units and AI accelerators | Hailo-8, Coral Edge TPU, Jetson Orin |
| SBC | Single board computers | Raspberry Pi 5, ODROID-N2+, Orange Pi 5 |
| ASIC | Application-specific integrated circuits | Google TPU, Groq LPU |
| SoC | System-on-chip | Snapdragon X Elite, Apple M3 Ultra |
| System | Complete systems and appliances | DGX Spark, Mac Mini M4 |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Live Demo

Deployed at [siliconrank.pages.dev](https://siliconrank.pages.dev)

## License

MIT License — see [LICENSE](LICENSE) for details.
