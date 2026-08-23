# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SiliconRank** is an Open Hardware Intelligence Platform for comparing CPUs, GPUs, NPUs, SBCs, AI accelerators, ASICs, SoCs, and complete systems. It provides normalized benchmarks, efficiency metrics (TOPS/$, TOPS/W, perf/$), interactive charts, side-by-side comparisons, and global search.

**URL:** https://siliconrank.pages.dev

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Charts:** Recharts
- **Tables:** TanStack React Table v8
- **Routing:** React Router v7 (lazy-loaded pages)
- **Testing:** Vitest + Testing Library
- **PWA:** Service worker + manifest with offline support
- **Deployment:** Cloudflare Pages (`wrangler`)

## Commands

```bash
npm run dev              # Start Vite dev server
npm test                 # Run Vitest tests (headless)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Run ESLint
npm run build            # TypeScript compile + Vite build + sitemap
npm run build:api        # Build MCP server data file
npm run deploy           # Build and deploy to Cloudflare Pages
```

## Architecture

```
src/
├── App.tsx              # Route definitions (lazy-loaded pages)
├── main.tsx            # Entry point, BrowserRouter, service worker
├── types/index.ts       # Shared TypeScript types
├── components/
│   ├── layout/         # Layout (navbar, footer, search), BackToTop
│   ├── charts/         # Recharts wrappers (scatter, radar, heatmap, etc.)
│   ├── reports/        # Data quality / analytics charts
│   └── studio/         # Studio mode panels (ScatterPanel, RankingPanel, etc.)
├── hooks/              # useTheme, useMetaDescription
├── lib/
│   ├── api/            # In-memory data API (getDevice, searchDevices, etc.)
│   ├── data/seed.ts    # Hardware data (vendors, families, devices, benchmarks, prices)
│   ├── normalization/  # Score normalization logic
│   ├── storage.ts      # localStorage wrapper
│   └── utils.ts        # fmtNum, fmtRam helpers
├── pages/              # BrowsePage, DevicePage, ComparePage, ChartsPage,
                        # StudioPage, ToolsPage, ReportsPage, DocsPage,
                        # LandingPage, NotFoundPage
└── test/               # Vitest test files (accessibility, filters, URL state, etc.)
```

### Key Patterns

- **In-memory seed data** — All hardware data lives in `src/lib/data/seed.ts`; no external database
- **URL-driven filter state** — BrowsePage reads/writes filter state to URL search params
- **Lazy-loaded routes** — Each page is code-split via `React.lazy()` with individual ErrorBoundary wrappers
- **Computed metrics** — `lib/api/computed.ts` derives effective INT8 TOPS, TOPS/$, TOPS/W from raw seed data
- **Manual chunks** — Vite config splits `recharts` and `react-vendor` chunks
- **Studio mode** — Full dataset spreadsheet at `src/components/studio/` with filtering, notes, export

### MCP Server

`mcp-server/index.mjs` exposes the hardware data via Model Context Protocol for AI agent consumption. Build with `npm run build:api`. The MCP server serves `mcp-server/data.json` (generated from seed data).

## Data Model

Core types in `src/types/index.ts`:
- `Vendor`, `DeviceFamily`, `Device`, `BenchmarkResult`, `PricePoint`
- `DeviceCategory` enum (CPU, GPU, NPU, SBC, etc.)
- `NormalizedScore` — cross-vendor benchmark normalization

## Testing

- Tests live in `src/test/` alongside source files
- Run a single test file: `npm test -- <filename>`
- Coverage report: `npm run test:coverage`

## Best Practices

### Component Patterns
- Small, focused components with clear responsibilities
- Memoize expensive computations with `useMemo`
- Extract event handlers with `useCallback`
- Use `memo()` for pure presentational components

### Code Quality
- **Magic numbers**: Extract to named constants (e.g., `MAX_TDP`, `MAX_PRICE`)
- **No duplicate logic**: Reuse functions across components
- **WCAG AAA contrast**: Dark mode text uses `#c4cdd9` (secondary) and `#8899aa` (muted)

### Accessibility
- Skip-to-content link for keyboard users
- `aria-current="page"` on active nav links
- Focus trap for modals and mobile menus
- `aria-live="polite"` for dynamic content updates

### CI/CD
- Parallel job execution (lint, test, build run independently)
- node_modules and Vite caching for faster CI
- Coverage thresholds enforced in CI (65% lines, 55% branches)
